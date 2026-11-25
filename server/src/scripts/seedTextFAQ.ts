/**
 * Text FAQ Seeder Script
 * ──────────────────────────────────────────────────────────────────
 * Run this ONCE to seed plain-text FAQ content directly into Qdrant
 * WITHOUT needing a PDF file. Good for hardcoding Q&A pairs.
 *
 * Usage:
 *   cd server
 *   npx tsx src/scripts/seedTextFAQ.ts
 *
 * To add content: edit the FAQ_CONTENT string below.
 */

import "dotenv/config";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import { qdrant } from "../lib/qdrant.js";
import { getEmbeddings } from "../llm/embedding.js";
import { sql } from "../lib/db.js";
import crypto from "node:crypto";

// ─────────────────────────────────────────────────────────────────
// ✏️  EDIT THIS — paste your FAQ content here
// ─────────────────────────────────────────────────────────────────
const DOCUMENT_NAME = "iit-roorkee-ug-admission-faq";   // unique name for this FAQ batch
const SOURCE_LABEL  = "faq_seed";                       // keep as "faq_seed" so RAG always searches it

const FAQ_CONTENT = `
FREQUENTLY ASKED QUESTIONS RELATED TO UG ADMISSION — IIT ROORKEE

Special Notes and Travel Advisories:
1. Kanwar Travel Advisory: The Uttarakhand government has announced road closures in Haridwar and surrounding areas from July 19 to July 23 because of the Kanwar Yatra. Key routes, including NH-58 (Dehradun–Delhi Highway) and the Delhi–Meerut Expressway, will be affected, with restrictions and closures for both heavy and light vehicles. Students are advised to plan their travel accordingly to avoid delays and inconvenience.
2. Official Updates: Follow official WhatsApp channel for the latest updates related to admission at IIT Roorkee.
3. Information Link: Complete information related to UG Admission, like list of documents, link for fee payment, guidelines for online registration, and other important information, is available on the official IIT Roorkee portal.

Question 1: Will IIT Roorkee send an individual offer letter for the UG program?
Answer: No, IIT Roorkee does not send an individual offer letter. Please use the JoSAA Seat Allotment letter as an offer letter.

Question 2: How can I obtain the fee structure for the UG program for a bank loan?
Answer: The detailed Fee Structure is available at Institute Fees section on the official website.

Question 3: Will accommodation be provided to those who arrive earlier than the scheduled date, i.e., 25.07.2025?
Answer: Yes, temporary accommodation will be provided to students only. The student may contact the respective Bhawan officials as provided in the information brochure.

Question 4: Will academic registration-cum-document verification be done before the scheduled date for those who reach IIT Roorkee before 25.07.2025?
Answer: No, academic registration-cum-document verification will be done only on 25.07.2025. It will not be done before the scheduled date.

Question 5: Whether the Medical Certificate produced at the time of JOSAA will be accepted?
Answer: A certificate, either in the format issued by JoSAA or the one provided in the IIT Roorkee Information Brochure, duly certified by a registered medical practitioner with their registration number and official seal, will be accepted.

Question 6: Whether a notary required for the Anti-Ragging Certificate?
Answer: The student must submit the Anti-Ragging Certificate on a Non-Judicial Stamp Paper of ₹10 or higher denomination. If an Oath Commissioner is not available, the certificate must be notarized.

Question 7: What should be filled in the section of Enrolment No. for Affidavit?
Answer: Enrolment No. will be provided shortly. Till then, you can leave the Enrolment column blank.

Question 8: Why am I unable to pay fees?
Answer: Use your JEE Advanced Roll No. and JEE-registered email ID while paying fees.

Question 9: Will students who are unable to attend on the scheduled date due to any reason get an opportunity for their academic registration later?
Answer: Please plan your travel so that you arrive on or before July 25, 2025. However, under special circumstances, if a student is unable to arrive by this date, they will be given an opportunity to complete their verification and physical registration on the next available date.

Question 10: How to create an ABC ID?
Answer: ABC ID is essential for online registration. Under "Identify Type", select "New Admission", and its value will be the Enrolment Number that will be shared with you shortly from IIT Roorkee to your JoSAA registered email ID.

Question 11: Whether DigiLocker documents valid for document verification?
Answer: Yes, DigiLocker documents are equally valid for document verification.
`;
// ─────────────────────────────────────────────────────────────────

function chunkText(text: string, size = 2000, overlap = 300): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size - overlap) {
    const c = text.slice(i, i + size).trim();
    if (c.length > 50) chunks.push(c);
  }
  return chunks;
}

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      source TEXT NOT NULL DEFAULT 'faq_seed',
      total_chunks INT DEFAULT 0,
      file_hash TEXT,
      status TEXT DEFAULT 'indexed',
      indexed_at TIMESTAMPTZ DEFAULT NOW(),
      last_updated TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  const fileHash = crypto.createHash("sha256").update(FAQ_CONTENT).digest("hex");

  // Check if already seeded with same content
  const existing = await sql`SELECT file_hash FROM documents WHERE filename = ${DOCUMENT_NAME}`;
  if (existing.length > 0 && existing[0]!.file_hash === fileHash) {
    console.log(`✅ "${DOCUMENT_NAME}" already seeded and unchanged. Nothing to do.`);
    await sql.end();
    return;
  }

  // Remove old vectors if re-seeding
  if (existing.length > 0) {
    console.log(`🔄 Content changed — removing old vectors for "${DOCUMENT_NAME}"...`);
    await qdrant.delete("college_docs", {
      wait: true,
      filter: { must: [{ key: "document", match: { value: DOCUMENT_NAME } }] },
    });
    await sql`DELETE FROM documents WHERE filename = ${DOCUMENT_NAME}`;
  }

  const chunks = chunkText(FAQ_CONTENT.trim());
  console.log(`📦 Embedding ${chunks.length} chunks for "${DOCUMENT_NAME}"...`);

  const BATCH = 8;
  let totalUpserted = 0;

  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH);
    const embeddings = await getEmbeddings(batch);
    const points = batch.map((text, j) => ({
      id: crypto.randomUUID(),
      vector: embeddings[j]!,
      payload: {
        text,
        document: DOCUMENT_NAME,
        source: SOURCE_LABEL,
        page_number: 1,
        chunk_index: i + j,
      },
    }));
    await qdrant.upsert("college_docs", { wait: true, points });
    totalUpserted += points.length;
    console.log(`  ↳ Batch ${Math.floor(i / BATCH) + 1}: ${points.length} vectors upserted`);
  }

  // Record in PostgreSQL
  await sql`
    INSERT INTO documents (filename, source, total_chunks, file_hash, status)
    VALUES (${DOCUMENT_NAME}, ${SOURCE_LABEL}, ${chunks.length}, ${fileHash}, 'indexed')
    ON CONFLICT (filename) DO UPDATE
      SET total_chunks = ${chunks.length},
          file_hash    = ${fileHash},
          status       = 'indexed',
          last_updated = NOW()
  `;

  console.log(`\n✅ Done! "${DOCUMENT_NAME}" seeded:`);
  console.log(`   • ${totalUpserted} vectors in Qdrant (college_docs)`);
  console.log(`   • Tracked in PostgreSQL (documents table)`);
  console.log(`   • The chatbot will now answer from this FAQ in PDF/RAG mode.`);

  await sql.end();
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
