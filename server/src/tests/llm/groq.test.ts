import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  generateSearchQuery,
  generateStream,
  generateChatCompletion,
  generateMultiQuery,
  evaluateIntent,
  generateOptimizedQueryAndIntent,
  getProvider,
  getChatModel,
  getFastModel,
} from "../../llm/openai.js";
import type { ChatMessage } from "../../types/chat.js";

function mockFetchJson(json: any, ok = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: async () => json,
    text: async () => JSON.stringify(json),
    body: new ReadableStream(),
  } as any);
}

beforeEach(() => {
  process.env.GROQ_API_KEY = "gsk_test_groq_key";
  delete process.env.OPENROUTER_API_KEY;
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.GROQ_API_KEY;
});

describe("Groq LLM Provider", () => {
  it("detects Groq as active provider when GROQ_API_KEY is present", () => {
    expect(getProvider()).toBe("groq");
    expect(getChatModel()).toBe("openai/gpt-oss-120b");
    expect(getFastModel()).toBe("openai/gpt-oss-20b");
  });

  it("calls Groq endpoint with fast model for generateSearchQuery", async () => {
    mockFetchJson({
      choices: [{ message: { content: "IIT Bombay CSE fees 2024" } }],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    });

    const messages: ChatMessage[] = [
      { role: "user", content: "What are the fees for IIT Bombay CSE?" },
    ];
    const query = await generateSearchQuery(messages);

    expect(query).toBe("IIT Bombay CSE fees 2024");
    expect(fetch).toHaveBeenCalledOnce();
    const [url, options] = (fetch as any).mock.calls[0];
    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(options.headers["Authorization"]).toBe("Bearer gsk_test_groq_key");

    const body = JSON.parse(options.body);
    expect(body.model).toBe("openai/gpt-oss-20b");
  });

  it("calls Groq endpoint with chat model and stream_options for generateStream", async () => {
    const mockBody = new ReadableStream();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: mockBody,
    } as any);

    const stream = await generateStream([
      { role: "user", content: "Tell me about NIT Trichy." },
    ]);

    expect(stream).toBe(mockBody);
    const [url, options] = (fetch as any).mock.calls[0];
    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");

    const body = JSON.parse(options.body);
    expect(body.model).toBe("openai/gpt-oss-120b");
    expect(body.stream).toBe(true);
    expect(body.stream_options).toEqual({ include_usage: true });
    expect(body.max_tokens).toBe(8192);
  });

  it("calls Groq endpoint with response_format json_object in generateChatCompletion", async () => {
    mockFetchJson({
      choices: [{ message: { content: '{"result":"success"}' } }],
      usage: { prompt_tokens: 20, completion_tokens: 10, total_tokens: 30 },
    });

    const res = await generateChatCompletion(
      [{ role: "user", content: "Return JSON data" }],
      undefined,
      1000,
      true
    );

    expect(res).toBe('{"result":"success"}');
    const [, options] = (fetch as any).mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.model).toBe("openai/gpt-oss-120b");
    expect(body.response_format).toEqual({ type: "json_object" });
  });

  it("calls Groq endpoint for generateMultiQuery using fast model", async () => {
    mockFetchJson({
      choices: [{ message: { content: '["IITB tuition", "IIT Bombay costs"]' } }],
    });

    const queries = await generateMultiQuery("IIT Bombay fees");
    expect(queries).toHaveLength(3);
    const [, options] = (fetch as any).mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.model).toBe("openai/gpt-oss-20b");
  });

  it("evaluates intent using Groq fast model", async () => {
    mockFetchJson({
      choices: [{ message: { content: "VALID" } }],
    });

    const intent = await evaluateIntent([
      { role: "user", content: "How does counselling work?" },
    ]);
    expect(intent).toBe("VALID");
  });

  it("generates optimized query and intent with json_object format", async () => {
    mockFetchJson({
      choices: [{
        message: {
          content: JSON.stringify({
            intent: "VALID",
            query: "BITS Pilani cutoff score",
            variants: ["BITS Pilani entrance rank", "BITS Pilani admission cutoff"],
          }),
        },
      }],
    });

    const result = await generateOptimizedQueryAndIntent([
      { role: "user", content: "What is BITS Pilani cutoff?" },
    ]);

    expect(result.intent).toBe("VALID");
    expect(result.query).toBe("BITS Pilani cutoff score");
    expect(result.variants).toHaveLength(2);
    const [, options] = (fetch as any).mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.response_format).toEqual({ type: "json_object" });
  });

  it("handles Groq error cleanly on non-200 responses", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Invalid API Key",
    } as any);

    await expect(
      generateStream([{ role: "user", content: "hi" }])
    ).rejects.toThrow("Groq Error: Invalid API Key");
  });
});
