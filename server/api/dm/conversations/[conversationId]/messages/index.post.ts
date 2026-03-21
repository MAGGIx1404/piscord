import { sendMessage } from "../../../../../services/dmService";
import { broadcastToUser } from "../../../../../routes/_ws";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const conversationId = getRouterParam(event, "conversationId");

  if (!conversationId) {
    throw createError({ statusCode: 400, message: "Conversation ID is required" });
  }

  const { content } = await readBody<{ content: string }>(event);
  if (!content?.trim()) {
    throw createError({ statusCode: 400, message: "Message content is required" });
  }

  const { message, recipientId } = await sendMessage(conversationId, userId, content.trim());

  // Broadcast to the recipient via WebSocket
  broadcastToUser(recipientId, {
    type: "dm:new",
    message,
    conversationId
  });

  return { message };
});
