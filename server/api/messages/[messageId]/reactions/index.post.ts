import { toggleReaction, getMessageById } from "../../../../services/messageService";
import { broadcastToChannel } from "../../../../routes/_ws";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const messageId = getRouterParam(event, "messageId");

  if (!messageId) {
    throw createError({ statusCode: 400, message: "Message ID is required" });
  }

  const body = await readBody<{ emoji: string }>(event);

  if (!body.emoji?.trim()) {
    throw createError({ statusCode: 400, message: "Emoji is required" });
  }

  const result = await toggleReaction(messageId, userId, body.emoji);

  // Get the message to find its channel for broadcasting
  const message = await getMessageById(messageId, userId);
  if (message) {
    broadcastToChannel(message.channel_id, {
      type: "reaction:update",
      messageId,
      reactions: result.reactions
    });
  }

  return result;
});
