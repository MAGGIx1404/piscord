// ─── AI Service (Server-side Puter.js proxy) ────────────────────────────────
//
// All AI calls go through Puter.js REST API.
// The client sends its Puter auth token via X-Puter-Token header,
// and the server proxies the call to api.puter.com.

export interface RunAIParams {
  model: string;
  messages: Array<{ role: string; content: string }>;
  config?: {
    temperature?: number;
    max_tokens?: number;
    system_prompt?: string;
  };
  puterToken: string;
}

export interface RunAIResult {
  content: string;
  latency_ms: number;
  model: string;
}

export async function runAI(params: RunAIParams): Promise<RunAIResult> {
  const startTime = Date.now();

  const messages = params.config?.system_prompt
    ? [{ role: "system", content: params.config.system_prompt }, ...params.messages]
    : params.messages;

  const body = JSON.stringify({
    interface: "puter-chat-completion",
    service: "ai-chat",
    method: "complete",
    args: {
      messages,
      model: params.model,
      ...(params.config?.temperature !== undefined && { temperature: params.config.temperature }),
      ...(params.config?.max_tokens !== undefined && { max_tokens: params.config.max_tokens })
    },
    auth_token: params.puterToken
  });

  const response = await $fetch<{ message?: { content: unknown } }>(
    "https://api.puter.com/drivers/call",
    {
      method: "POST",
      headers: { "Content-Type": "text/plain;actually=json" },
      body
    }
  );

  const latency_ms = Date.now() - startTime;
  const content = extractTextContent(response?.message?.content);

  if (!content) {
    throw createError({ statusCode: 502, message: "Empty response from AI provider" });
  }

  return { content, latency_ms, model: params.model };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTextContent(content: any): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("");
  }
  return content?.toString?.() || "";
}

export const SUPPORTED_MODELS = [
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", provider: "anthropic" },
  { id: "claude-opus-4-6", name: "Claude Opus 4.6", provider: "anthropic" },
  { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5", provider: "anthropic" },
  { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "google" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "google" },
  { id: "mistral-large-latest", name: "Mistral Large", provider: "mistral" },
  { id: "llama-3.1-70b", name: "Llama 3.1 70B", provider: "meta" }
] as const;

export type SupportedModelId = (typeof SUPPORTED_MODELS)[number]["id"];
