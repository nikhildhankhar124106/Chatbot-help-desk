import { z } from "zod";
import dotenv from "dotenv";
const isTest = process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);
if (isTest) {
  dotenv.config();
  process.env.NODE_ENV = "test";
} else {
  dotenv.config({ override: true });
}

const envSchema = z.object({
  PORT: z.string().transform(Number).default(4005),
  DATABASE_URL: z.string().url().optional().default("postgresql://user:password@localhost:5432/college_chatbot"),
  QDRANT_URL: z.string().url().optional().default("http://localhost:6333"),
  QDRANT_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GROQ_CHAT_MODEL: z.string().optional().default("openai/gpt-oss-120b"),
  GROQ_FAST_MODEL: z.string().optional().default("openai/gpt-oss-20b"),
  OPENROUTER_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ALLOWED_ORIGIN: z.string().default("*"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  TAVILY_API_KEY: z.string().optional(),
  ELEVEN_LABS_API_KEY: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
}).refine(
  data => Boolean(data.GROQ_API_KEY || data.OPENROUTER_API_KEY || data.GEMINI_API_KEY || data.NODE_ENV === "test"),
  {
    message: "At least one AI API key (GROQ_API_KEY, OPENROUTER_API_KEY, or GEMINI_API_KEY) must be provided.",
    path: ["GROQ_API_KEY"],
  }
);

export const env = envSchema.parse(process.env);

export function validateEnv() {
  try {
    envSchema.parse(process.env);
    console.log("✅ Environment variables validated.");
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:", JSON.stringify(error.format(), null, 2));
    }
    process.exit(1);
  }
}
