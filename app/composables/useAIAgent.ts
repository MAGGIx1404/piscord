import type { ChatMessage, AIAgent } from "./useChannelChat";

export function useAIAgent() {
  const api = useApi();
  const processing = ref(false);

  async function handleAIMention(
    userMessage: ChatMessage,
    aiAgent: AIAgent,
    channelId: string,
    _communityId: string,
    _canManage: boolean,
    addMessage: (msg: ChatMessage) => void
  ) {
    if (processing.value) return;
    processing.value = true;

    try {
      const aiName = aiAgent.name || "";
      const userContent =
        userMessage.content?.replace(new RegExp(`@${aiName}\\b`, "gi"), "").trim() || "";

      if (!userContent) {
        processing.value = false;
        return;
      }

      const result = await api<{ message: ChatMessage; toolResults: string[] }>(
        `/api/channels/${channelId}/ai-chat`,
        {
          method: "POST",
          body: {
            content: userContent,
            replyToId: userMessage.id
          }
        }
      );

      addMessage(result.message);
    } catch (error) {
      console.error("[AI Agent Error]", error);
      try {
        const msg = await postAIMessage(
          channelId,
          "Sorry, I encountered an error processing your request. Please try again.",
          userMessage.id
        );
        addMessage(msg);
      } catch {
        // silently fail
      }
    } finally {
      processing.value = false;
    }
  }

  async function postAIMessage(
    channelId: string,
    content: string,
    replyToId: string
  ): Promise<ChatMessage> {
    const data = await api<{ message: ChatMessage }>(`/api/channels/${channelId}/messages`, {
      method: "POST",
      body: {
        content,
        type: "ai",
        reply_to_id: replyToId
      }
    });
    return data.message;
  }

  return {
    processing,
    handleAIMention
  };
}
