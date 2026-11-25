import 'dotenv/config';
import postgres from 'postgres';
import { QdrantClient } from '@qdrant/js-client-rest';

async function checkConnections() {
  console.log("🔍 Checking Backend Connections...");

  // 1. Check Postgres
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL missing");
  } else {
    try {
      const sql = postgres(process.env.DATABASE_URL, {
        ...(process.env.DATABASE_URL.includes("neon.tech") || process.env.DATABASE_URL.includes("sslmode=require") ? { ssl: "require" as const } : {}),
      });
      await sql`SELECT 1`;
      console.log("✅ PostgreSQL Connection: OK");
      await sql.end();
    } catch (err) {
      console.error("❌ PostgreSQL Connection: FAILED");
      console.error((err as Error).message || err);
    }
  }

  // 2. Check Qdrant
  if (!process.env.QDRANT_URL) {
    console.error("❌ QDRANT_URL missing");
  } else {
    try {
      const qdrant = new QdrantClient({
        url: process.env.QDRANT_URL,
        ...(process.env.QDRANT_API_KEY ? { apiKey: process.env.QDRANT_API_KEY } : {}),
        checkCompatibility: false,
      });
      await qdrant.getCollections();
      console.log("✅ Qdrant Connection: OK");
    } catch (err) {
      console.error("❌ Qdrant Connection: FAILED");
      console.error((err as Error).message);
    }
  }

  // 3. Check Primary LLM (Groq)
  if (process.env.GROQ_API_KEY) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json() as { data?: { id: string }[] };
        const modelCount = data.data?.length || 0;
        console.log(`✅ Groq API Key: VALID (${modelCount} models available)`);
      } else {
        console.error("❌ Groq API Key: INVALID", await res.text());
      }
    } catch (err) {
      console.error("❌ Groq API Check: ERROR", (err as Error).message);
    }
  } else if (process.env.OPENROUTER_API_KEY) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
        headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
      });
      if (res.ok) {
        console.log("✅ OpenRouter API Key: VALID");
      } else {
        console.error("❌ OpenRouter API Key: INVALID", await res.text());
      }
    } catch (err) {
      console.error("❌ OpenRouter API Check: ERROR", (err as Error).message);
    }
  } else {
    console.warn("⚠️ No LLM API Key found (set GROQ_API_KEY in your .env)");
  }

  // 4. Check Embeddings Provider (Gemini / OpenAI / OpenRouter)
  if (process.env.GEMINI_API_KEY) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
      if (res.ok) {
        console.log("✅ Gemini Embeddings API Key: VALID");
      } else {
        console.error("❌ Gemini API Key: INVALID");
      }
    } catch (err) {
      console.error("❌ Gemini API Check: ERROR", (err as Error).message);
    }
  } else if (process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY) {
    console.log("✅ Embedding Provider: OpenRouter/OpenAI configured");
  } else {
    console.log("ℹ️ Vector Embeddings: Standalone Groq mode (zero-vector fallback; keyword matching & live web search active)");
  }
}

checkConnections();
