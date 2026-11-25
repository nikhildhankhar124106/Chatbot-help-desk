/**
 * FAQ Document Seeder
 * ───────────────────────────────────────────────────────────────────
 * On every server startup, scans `server/data/faq/` for PDF files and
 * seeds any NEW ones into:
 *   1. Qdrant `college_docs` collection  → enables RAG vector search
 *   2. PostgreSQL `documents` table      → prevents re-embedding on restart
 *
 * HOW TO USE:
 *   - Drop any .pdf file into `server/data/faq/`
 *   - Restart the server — it auto-indexes on startup
 *   - The chatbot can now answer questions from that PDF forever
 *
 * DEDUPLICATION:
 *   - Uses SHA-256 file hash stored in PostgreSQL
 *   - If the file is unchanged, it is SKIPPED (no duplicate vectors)
 *   - If you replace a file with new content, delete its DB row to re-index
 */

import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { sql } from "./db.js";
import { qdrant } from "./qdrant.js";
import { getEmbeddings } from "../llm/embedding.js";
import { extractTextFromPDF } from "../utils/ocr.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the FAQ folder (server/data/faq/)
const FAQ_DIR = path.join(__dirname, "../../data/faq");

const CHUNK_SIZE = 3000;   // characters per chunk
const CHUNK_OVERLAP = 400; // overlap between chunks
const EMBED_BATCH = 8;     // embed 8 chunks at a time

// ── Hash a buffer for deduplication ──────────────────────────────────
function hashBuffer(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

// ── Chunk a text string with sliding window ────────────────────────
function chunkText(text: string): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
    const chunk = text.slice(i, i + CHUNK_SIZE).trim();
    if (chunk.length > 100) chunks.push(chunk);
  }
  return chunks;
}

// ── Seed a single PDF into Qdrant + PostgreSQL ─────────────────────
async function seedPDF(filePath: string, filename: string): Promise<void> {
  console.log(`[FAQ Seeder] Processing: ${filename}`);

  const buffer = await fs.readFile(filePath);
  const fileHash = hashBuffer(buffer);

  // Check if already indexed with same hash
  const existing = await sql`
    SELECT id, file_hash FROM documents WHERE filename = ${filename} LIMIT 1
  `;

  if (existing.length > 0) {
    if (existing[0]!.file_hash === fileHash) {
      console.log(`[FAQ Seeder] Skipping "${filename}" — already indexed (hash unchanged).`);
      return;
    }
    // File changed — remove old Qdrant vectors and re-index
    console.log(`[FAQ Seeder] "${filename}" changed — re-indexing...`);
    await qdrant.delete("college_docs", {
      wait: true,
      filter: { must: [{ key: "document", match: { value: filename } }] },
    });
    await sql`DELETE FROM documents WHERE filename = ${filename}`;
  }

  // Extract text from PDF (3-tier: pdfjs → pdf-parse → Tesseract OCR)
  let pages;
  try {
    pages = await extractTextFromPDF(buffer, filename);
  } catch (err) {
    console.error(`[FAQ Seeder] Failed to extract text from "${filename}":`, err);
    return;
  }

  const fullText = pages.map((p) => p.text).join("\n\n");
  if (fullText.trim().length < 50) {
    console.warn(`[FAQ Seeder] "${filename}" produced no readable text — skipping.`);
    return;
  }

  // Build page-aware chunks
  const allChunks: { text: string; page: number; chunkIndex: number }[] = [];
  let globalIndex = 0;

  for (const page of pages) {
    if (page.text.trim().length < 50) continue;
    const pageChunks = chunkText(page.text);
    for (const chunk of pageChunks) {
      allChunks.push({ text: chunk, page: page.page, chunkIndex: globalIndex++ });
    }
  }

  if (allChunks.length === 0) {
    console.warn(`[FAQ Seeder] No usable chunks from "${filename}" — skipping.`);
    return;
  }

  console.log(`[FAQ Seeder] "${filename}" → ${allChunks.length} chunks. Embedding...`);

  // Embed + upsert in batches
  let totalUpserted = 0;
  for (let i = 0; i < allChunks.length; i += EMBED_BATCH) {
    const batch = allChunks.slice(i, i + EMBED_BATCH);
    const embeddings = await getEmbeddings(batch.map((c) => c.text));

    const points = batch.map((c, j) => ({
      id: crypto.randomUUID(),
      vector: embeddings[j]!,
      payload: {
        text: c.text,
        document: filename,         // used for filtering in RAG
        source: "faq_seed",         // marks this as a pre-seeded FAQ doc
        page_number: c.page,
        chunk_index: c.chunkIndex,
      },
    }));

    await qdrant.upsert("college_docs", { wait: true, points });
    totalUpserted += points.length;
  }

  // Record in PostgreSQL so we skip on next restart
  await sql`
    INSERT INTO documents (filename, source, total_chunks, file_hash, status)
    VALUES (${filename}, 'faq_seed', ${allChunks.length}, ${fileHash}, 'indexed')
    ON CONFLICT (filename) DO UPDATE
      SET total_chunks = ${allChunks.length},
          file_hash    = ${fileHash},
          status       = 'indexed',
          last_updated = NOW()
  `;

  console.log(
    `[FAQ Seeder] ✅ "${filename}" seeded — ${totalUpserted} vectors in Qdrant, tracked in PostgreSQL.`
  );
}

// ── Main entry: scan FAQ folder and seed all PDFs ─────────────────
export async function seedFAQDocuments(): Promise<void> {
  // Ensure the FAQ folder exists
  if (!fsSync.existsSync(FAQ_DIR)) {
    await fs.mkdir(FAQ_DIR, { recursive: true });
    console.log(`[FAQ Seeder] Created FAQ folder at: ${FAQ_DIR}`);
    console.log(`[FAQ Seeder] Drop PDF files into this folder and restart to index them.`);
    return;
  }

  let entries: string[];
  try {
    entries = await fs.readdir(FAQ_DIR);
  } catch {
    console.warn(`[FAQ Seeder] Cannot read FAQ folder: ${FAQ_DIR}`);
    return;
  }

  const pdfFiles = entries.filter((f) => f.toLowerCase().endsWith(".pdf"));

  if (pdfFiles.length === 0) {
    console.log(`[FAQ Seeder] No PDF files found in ${FAQ_DIR}. Drop PDFs there to enable FAQ RAG.`);
    return;
  }

  console.log(`[FAQ Seeder] Found ${pdfFiles.length} PDF(s) in FAQ folder. Checking...`);

  for (const filename of pdfFiles) {
    const filePath = path.join(FAQ_DIR, filename);
    try {
      await seedPDF(filePath, filename);
    } catch (err: any) {
      console.error(`[FAQ Seeder] Error seeding "${filename}":`, err.message);
    }
  }

  console.log(`[FAQ Seeder] ✅ FAQ seeding complete.`);
}
