import { fetchWithTimeout } from "../utils/fetchUtils.js";
import type { ChatMessage } from "../types/chat.js";
import { logApiUsage } from "../lib/apiUsageLogger.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export function getProvider(): "groq" | "openrouter" {
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  return "groq";
}

export function getApiUrl(): string {
  return getProvider() === "groq" ? GROQ_URL : OPENROUTER_URL;
}

export function getChatModel(): string {
  if (getProvider() === "groq") {
    return process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-120b";
  }
  return "openai/gpt-4o-mini";
}

export function getFastModel(): string {
  if (getProvider() === "groq") {
    return process.env.GROQ_FAST_MODEL || "openai/gpt-oss-20b";
  }
  return "openai/gpt-4o-mini";
}

export function getHeaders(): Record<string, string> {
  if (getProvider() === "groq") {
    return {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    };
  }
  return {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "https://unibot.ai",
    "X-Title": "UniBot AI",
  };
}

function formatApiError(provider: string, errText: string): string {
  const providerName = provider === "groq" ? "Groq" : "OpenRouter";
  try {
    const parsed = JSON.parse(errText);
    const message = parsed?.error?.message || parsed?.message;
    if (message) {
      if (message.toLowerCase().includes("invalid api key")) {
        return `${providerName} Error: Invalid API Key. Please configure a valid ${provider === "groq" ? "GROQ_API_KEY" : "OPENROUTER_API_KEY"} in server/.env`;
      }
      return `${providerName} Error: ${message}`;
    }
  } catch {}
  return `${providerName} Error: ${errText}`;
}

export async function generateStream(messages: ChatMessage[]) {
  const provider = getProvider();
  const model = getChatModel();
  const response = await fetchWithTimeout(
    getApiUrl(),
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        model,
        stream: true,
        stream_options: { include_usage: true },
        messages,
        max_tokens: 8192,
      }),
    },
    300000
  );
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(formatApiError(provider, errText));
  }
  return response.body;
}

export async function generateChatCompletion(
  messages: ChatMessage[],
  model?: string,
  maxTokens = 1000,
  jsonMode = false
) {
  const provider = getProvider();
  const chosenModel = (!model || model === "openai/gpt-4o-mini") ? getChatModel() : model;
  const response = await fetchWithTimeout(
    getApiUrl(),
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        model: chosenModel,
        messages,
        max_tokens: maxTokens,
        response_format: jsonMode ? { type: "json_object" } : undefined
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(formatApiError(provider, errText));
  }

  const data = await response.json();
  const usage = data.usage;
  logApiUsage({
    model: chosenModel,
    endpointType: "chat_completion",
    promptTokens: usage?.prompt_tokens,
    completionTokens: usage?.completion_tokens,
    totalTokens: usage?.total_tokens,
    metadata: { function: "generateChatCompletion" },
  });
  return data.choices?.[0]?.message?.content || "";
}

export async function generateSearchQuery(
  messages: ChatMessage[],
  detectedLangName: string = "English",
): Promise<string> {
  const lastMessage = messages[messages.length - 1]?.content || "";
  const sanitizedInput = lastMessage.replace(/SYSTEM:[\s\S]*?\n\n/g, "").trim();

  const langRule = detectedLangName !== "English"
    ? ` (5) The user is currently writing in ${detectedLangName}. ALWAYS translate and output the search query in ENGLISH only — the search index is in English.`
    : "";

  const model = getFastModel();
  const response = await fetchWithTimeout(
    getApiUrl(),
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              `You are a search query optimizer for UniBot AI — a College & University Intelligence Assistant. Your ONLY job is to rewrite the user's question into a clean, specific web search query optimized for retrieving academic institutional information. RULES: (1) ALWAYS output a search query — never refuse. (2) Only reply OUT_OF_DOMAIN if the question is completely unrelated to colleges, universities, or education (e.g., cooking recipes, sports results, movie reviews). (3) All questions about fees, courses, admissions, rankings, placements, scholarships, hostel, campus life, faculty, research, exams, or student life are IN DOMAIN. (4) Output ONLY the search query — no explanation.${langRule}`,
          },
          ...messages.slice(-5).map(m => m === messages[messages.length-1] ? { ...m, content: sanitizedInput } : m),
        ],
        max_tokens: 50,
      }),
    },
  );

  if (!response.ok) {
    console.error(
      "generateSearchQuery API Error:",
      response.status,
      await response.text().catch(() => ""),
    );
    return lastMessage;
  }

  try {
    const data = await response.json();
    const usage = data.usage;
    logApiUsage({
      model,
      endpointType: "search_query",
      promptTokens: usage?.prompt_tokens,
      completionTokens: usage?.completion_tokens,
      totalTokens: usage?.total_tokens,
      metadata: { function: "generateSearchQuery" },
    });
    const query =
      data.choices?.[0]?.message?.content?.replace(/\"/g, "") || lastMessage;
    console.log("Optimized Search Query:", query);
    return query;
  } catch (error) {
    console.error("generateSearchQuery JSON Parse Error:", error);
    return lastMessage;
  }
}

export async function generateMultiQuery(
  originalQuery: string,
): Promise<string[]> {
  const model = getFastModel();
  try {
    const response = await fetchWithTimeout(
      getApiUrl(),
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: `You are a search query diversifier for a College/University information system.
Given a search query, generate exactly 3 alternative phrasings that capture different angles and synonyms.

RULES:
1. Each variant must use different keywords while preserving the original intent.
2. Include abbreviations, full names, and alternate terms (e.g., "fees" → "tuition cost", "IIT" → "Indian Institute of Technology").
3. One variant should focus on specific details, one on broader context, one on common misspellings or colloquial terms.
4. Output ONLY a JSON array of 3 strings. No explanation.
5. Keep each query under 15 words.

Example input: "IIT Bombay placement stats"
Example output: ["IITB campus recruitment statistics", "Indian Institute of Technology Bombay job placement data", "IIT Bombay placement record package salary"]`,
            },
            { role: "user", content: originalQuery },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      console.warn("[MultiQuery] API error, falling back to original query");
      return [originalQuery];
    }

    const data = await response.json();
    const usage = data.usage;
    logApiUsage({
      model,
      endpointType: "multi_query",
      promptTokens: usage?.prompt_tokens,
      completionTokens: usage?.completion_tokens,
      totalTokens: usage?.total_tokens,
      metadata: { function: "generateMultiQuery" },
    });
    const content = data.choices?.[0]?.message?.content?.trim() || "";

    try {
      const queries = JSON.parse(content.match(/\[.*\]/s)?.[0] || content);
      if (Array.isArray(queries) && queries.length > 0) {
        const result = [originalQuery, ...queries.slice(0, 3)];
        console.log(`[MultiQuery] Expanded to ${result.length} variants: ${result.map(q => `"${q}"`).join(", ")}`);
        return result;
      }
    } catch (parseErr) {
      console.warn("[MultiQuery] Parse error, falling back to original query:", parseErr);
    }

    return [originalQuery];
  } catch (error) {
    console.error("[MultiQuery] Error:", error);
    return [originalQuery];
  }
}

export async function evaluateIntent(messages: ChatMessage[]): Promise<string> {
  const lastMessage = messages[messages.length - 1]?.content || "";
  const sanitizedInput = lastMessage.replace(/SYSTEM:[\s\S]*?\n\n/g, "").trim();

  const academicKeywords = [
    "fees", "placement", "ranking", "admission", "cutoff", "eligibility", 
    "course", "curriculum", "syllabus", "hostel", "scholarship", "internship",
    "better", "best", "worst", "versus", " vs ", "difference", "compare",
    "univer", "clg", "collge", "college", "institute", "faculty",
    "hackathon", "fest", "event", "workshop", "campus", "tech", "seminar",
    "alumni", "club", "society", "mess", "sports", "gym", "library", "attendance",
    "exam", "test", "result", "mark", "grade", "rule", "policy", "dress",
    "wifi", "lab", "research", "founder", "history", "degree", "diploma"
  ];
  if (academicKeywords.some(kw => sanitizedInput.toLowerCase().includes(kw))) {
    return "VALID";
  }

  const model = getFastModel();
  const response = await fetchWithTimeout(
    getApiUrl(),
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `You are a domain classifier for UniBot AI — a comprehensive College & University Intelligence Assistant.
Your job is to evaluate whether the user's query falls within the academic/institutional domain.

VALID SCOPE (be GENEROUS — when in doubt, classify as VALID):
- Fees & Financial Aid: Tuition, hostel fees, mess charges, scholarships, education loans, financial aid
- Admissions: Eligibility, cut-offs, entrance exams (JEE, NEET, CAT, GATE, CUET, SAT, GRE, etc.), deadlines, counselling
- Courses & Programs: B.Tech, MBA, M.Tech, BBA, BCA, MBBS, LLB, Ph.D, diploma, syllabus, curriculum
- Rankings & Accreditation: NIRF, QS World, NAAC, NBA, Times Higher Education rankings
- Placements & Careers: Packages, recruiters, placement stats, internships, career guidance
- Campus Life: Hostels, mess/canteen, sports, gyms, libraries, labs, Wi-Fi, clubs, societies, fests, events
- Faculty & Research: Professors, publications, patents, startups, incubators, R&D
- Student Life: Attendance, grading, exams, results, marks, dress code, policies, student welfare
- People: Faculty profiles, alumni networks, notable graduates, founders, chancellors
- Comparisons: Any comparison or analysis between educational institutions
- Location & Infrastructure: Campus city, state, facilities, transport

OUT OF SCOPE (only classify OUT_OF_DOMAIN when clearly unrelated to education):
- General cooking, recipes, or food preparation (not campus mess)
- Medical/health advice unrelated to campus (symptoms, diagnoses, medications)
- Entertainment (movies, music, celebrity gossip, sports results unrelated to college sports)
- Politics, religion, or current events not tied to educational institutions
- Illegal activities or explicit content

RULE: If there is ANY connection to a college, university, or student/academic life, classify as VALID. Only use OUT_OF_DOMAIN for clearly unrelated topics.
Reply EXACTLY with 'VALID' or 'OUT_OF_DOMAIN'.`,
          },
          ...messages.slice(-3).map(m => m === messages[messages.length-1] ? { ...m, content: sanitizedInput } : m),
        ],
        max_tokens: 10,
        temperature: 0,
      }),
    },
  );

  if (!response.ok) return "VALID";

  try {
    const data = await response.json();
    const usage = data.usage;
    logApiUsage({
      model,
      endpointType: "intent_evaluation",
      promptTokens: usage?.prompt_tokens,
      completionTokens: usage?.completion_tokens,
      totalTokens: usage?.total_tokens,
      metadata: { function: "evaluateIntent" },
    });
    const result = data.choices?.[0]?.message?.content?.trim() || "VALID";
    return result.includes("OUT_OF_DOMAIN") ? "OUT_OF_DOMAIN" : "VALID";
  } catch {
    return "VALID";
  }
}

export async function generateOptimizedQueryAndIntent(
  messages: ChatMessage[],
  detectedLangName: string = "English",
  contextHint?: string
): Promise<{ query: string; intent: "VALID" | "OUT_OF_DOMAIN"; variants: string[] }> {
  const lastMessage = messages[messages.length - 1]?.content || "";
  const sanitizedInput = lastMessage.replace(/SYSTEM:[\s\S]*?\n\n/g, "").trim();

  const academicKeywords = [
    "fees", "placement", "ranking", "admission", "cutoff", "eligibility", 
    "course", "curriculum", "syllabus", "hostel", "scholarship", "internship",
    "better", "best", "worst", "versus", " vs ", "difference", "compare",
    "univer", "clg", "collge", "college", "institute", "faculty",
    "hackathon", "fest", "event", "workshop", "campus", "tech", "seminar",
    "alumni", "club", "society", "mess", "sports", "gym", "library", "attendance",
    "exam", "test", "result", "mark", "grade", "rule", "policy", "dress",
    "wifi", "lab", "research", "founder", "history", "degree", "diploma"
  ];
  const isLikelyAcademic = academicKeywords.some(kw => sanitizedInput.toLowerCase().includes(kw));

  const langRule = detectedLangName !== "English"
    ? ` (5) The user is writing in ${detectedLangName}. ALWAYS translate the 'query' into ENGLISH.`
    : "";

  const contextRule = contextHint 
    ? `\n6. IMPORTANT: The user is currently viewing information about **${contextHint}**. If their question is ambiguous (e.g. "what are the fees?", "show rankings"), assume they are referring to ${contextHint}. Include "${contextHint}" in the 'query' if it helps specificity.`
    : "";

  const model = getFastModel();
  try {
    const response = await fetchWithTimeout(
      getApiUrl(),
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: `You are a specialized query router for UniBot AI — a College & University Intelligence Assistant. Analyze the user's request.

RULES:
1. 'intent': Set to 'VALID' if the query relates to ANY of these: colleges, universities, admissions, fees, courses, programs, placements, rankings, scholarships, campus life, hostels, clubs, fests, faculty, research, exams, results, alumni, comparisons, or any institutional topic. Set to 'OUT_OF_DOMAIN' ONLY for clearly non-educational queries (e.g., cooking, celebrity gossip, medical diagnoses, political news).
2. 'query': A clean, keyword-dense English search query optimized for vector database retrieval. Include institution names, course names, and specific terms. ${langRule}
3. 'variants': Array of 2 alternative phrasings using synonyms and different keyword angles (e.g., "fees" → "tuition cost", "admission" → "enrollment process").
4. Output ONLY a valid JSON object: {"intent": "VALID"|"OUT_OF_DOMAIN", "query": "string", "variants": ["str1", "str2"]}
   - When in doubt, default to VALID. Academic topics are broad and include all aspects of student and institutional life.${contextRule}`,
            },
            ...messages.slice(-3).map(m => m === messages[messages.length-1] ? { ...m, content: sanitizedInput } : m),
          ],
          max_tokens: 150,
          temperature: 0,
          response_format: { type: "json_object" }
        }),
      }
    );

    if (!response.ok) throw new Error("LLM Router failed");

    const data = await response.json();
    const usage = data.usage;
    logApiUsage({
      model,
      endpointType: "query_router",
      promptTokens: usage?.prompt_tokens,
      completionTokens: usage?.completion_tokens,
      totalTokens: usage?.total_tokens,
      metadata: { function: "generateOptimizedQueryAndIntent" },
    });
    const result = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    
    return {
      query: result.query || sanitizedInput,
      intent: isLikelyAcademic ? "VALID" : (result.intent === "OUT_OF_DOMAIN" ? "OUT_OF_DOMAIN" : "VALID"),
      variants: Array.isArray(result.variants) ? result.variants : []
    };
  } catch (error) {
    console.error("[LLM Router] Error:", error);
    return { query: sanitizedInput, intent: "VALID", variants: [] };
  }
}
