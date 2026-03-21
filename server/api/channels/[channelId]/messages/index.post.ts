import { createMessage } from "../../../../services/messageService";
import type { CreateMessagePayload } from "../../../../services/messageService";
import { broadcastToChannel } from "../../../../routes/_ws";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const channelId = getRouterParam(event, "channelId");

  if (!channelId) {
    throw createError({ statusCode: 400, message: "Channel ID is required" });
  }

  const body = await readBody<CreateMessagePayload>(event);

  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content) {
    throw createError({ statusCode: 400, message: "Message content is required" });
  }

  const message = await createMessage(channelId, userId, {
    content,
    reply_to_id: body.reply_to_id,
    type: body.type
  });

  // Broadcast new message to all connected peers in the channel
  broadcastToChannel(channelId, {
    type: "message:new",
    message
  });

  return { message };
});
