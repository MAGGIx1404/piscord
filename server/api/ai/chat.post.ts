type ChatRole = "system" | "user" | "assistant";

interface ChatMessageInput {
  role: ChatRole;
  content: string;
}

interface ChatRequestBody {
  provider?: "ollama";
  model?: string;
  messages?: ChatMessageInput[];
}

export default defineEventHandler(async (event) => {
  requireAuth(event);

  const body = await readBody<ChatRequestBody>(event);

  if (body?.provider && body.provider !== "ollama") {
    throw createError({ statusCode: 400, message: "Only ollama provider is supported." });
  }

  const messages = (body?.messages ?? []).filter((m) => m?.content?.trim());
  if (messages.length === 0) {
    throw createError({ statusCode: 400, message: "At least one message is required." });
  }

  const config = useRuntimeConfig();
  const baseUrl = String(config.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
  const model = body?.model || String(config.OLLAMA_DEFAULT_MODEL || "llama3.2:latest");

  try {
    const response = await $fetch<{ message?: { content?: string } }>(`${baseUrl}/api/chat`, {
      method: "POST",
      body: {
        model,
        stream: false,
        messages
      }
    });

    return {
      model,
      message: response?.message?.content ?? ""
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reach Ollama.";
    throw createError({
      statusCode: 502,
      message: `Ollama request failed: ${message}`
    });
  }
});
