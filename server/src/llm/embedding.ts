import { logApiUsage } from "../lib/apiUsageLogger.js";

let warnedGroqEmbeddings = false;

export async function getEmbedding(text: string): Promise<number[]> {
  const result = await getEmbeddings([text]);
  return result[0] || new Array(768).fill(0);
}

export async function getEmbeddings(texts: string[], maxRetries = 4): Promise<number[][]> {
  if (texts.length === 0) return [];

  // 1. OpenAI / OpenRouter Embeddings (768 dimensions)
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (openRouterKey || openAiKey) {
    const isDirectOpenAi = !openRouterKey && !!openAiKey;
    const url = isDirectOpenAi
      ? "https://api.openai.com/v1/embeddings"
      : "https://openrouter.ai/api/v1/embeddings";
    const apiKey = openRouterKey || openAiKey;
    const model = isDirectOpenAi ? "text-embedding-3-small" : "openai/text-embedding-3-small";

    let retryCount = 0;
    let delayMs = process.env.NODE_ENV === "test" ? 0 : 2000;

    while (retryCount <= maxRetries) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            input: texts,
            dimensions: 768,
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          if ((response.status === 429 || response.status >= 500) && retryCount < maxRetries) {
            console.warn(`[Embedding API] Error ${response.status}: ${err}. Retrying in ${delayMs}ms... (Attempt ${retryCount + 1}/${maxRetries})`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            retryCount++;
            delayMs *= 2;
            continue;
          }
          console.error("Embedding API error (Final):", response.status, err);
          return texts.map(() => new Array(768).fill(0) as number[]);
        }

        const data = (await response.json()) as {
          data?: { embedding: number[] }[];
          usage?: { prompt_tokens: number; total_tokens: number };
        };
        const usage = data.usage;
        logApiUsage({
          model,
          endpointType: "embedding",
          promptTokens: usage?.prompt_tokens,
          totalTokens: usage?.total_tokens,
          metadata: { texts_count: texts.length },
        });
        const embeddings = data?.data?.map((d) => d.embedding);

        if (!embeddings || embeddings.length === 0) {
          console.error("Embedding API returned no embedding. Response:", JSON.stringify(data));
          return texts.map(() => new Array(768).fill(0) as number[]);
        }

        return embeddings;
      } catch (error) {
        if (retryCount < maxRetries) {
          console.warn(`[Embedding API] Fetch failed: ${error}. Retrying in ${delayMs}ms... (Attempt ${retryCount + 1}/${maxRetries})`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          retryCount++;
          delayMs *= 2;
          continue;
        }
        console.error("Embedding fetch failed completely after retries:", error);
        return texts.map(() => new Array(768).fill(0) as number[]);
      }
    }
  }

  // 2. Google Gemini Embeddings (Native 768 dimensions)
  if (process.env.GEMINI_API_KEY) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: texts.map((t) => ({
              model: "models/text-embedding-004",
              content: { parts: [{ text: t }] },
              outputDimensionality: 768,
            })),
          }),
        }
      );

      if (res.ok) {
        const data = (await res.json()) as { embeddings?: { values: number[] }[] };
        if (data.embeddings && data.embeddings.length > 0) {
          logApiUsage({
            model: "google/text-embedding-004",
            endpointType: "embedding",
            totalTokens: texts.reduce((acc, t) => acc + Math.ceil(t.length / 4), 0),
            metadata: { texts_count: texts.length, provider: "gemini" },
          });
          return data.embeddings.map((e) => e.values);
        }
      } else {
        console.warn("[Embedding API - Gemini] Error:", res.status, await res.text().catch(() => ""));
      }
    } catch (geminiErr) {
      console.warn("[Embedding API - Gemini] Failed, attempting fallback:", geminiErr);
    }
  }

  // 3. Fallback when using Groq standalone (Groq has no embeddings API)
  if (!warnedGroqEmbeddings) {
    warnedGroqEmbeddings = true;
    console.info(
      "[Embedding] Notice: Groq API does not host an embeddings endpoint. Returning zero vectors for vector search. Qdrant keyword matching and live web search remain active. (Tip: Set GEMINI_API_KEY or OPENAI_API_KEY if you require dense vector embeddings)."
    );
  }

  return texts.map(() => new Array(768).fill(0) as number[]);
}
