import { createError, getRouterParam, getQuery } from "h3";
import { getMessagesByChannel } from "../../../../services/messageService";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const channelId = getRouterParam(event, "channelId");

  if (!channelId) {
    throw createError({ statusCode: 400, message: "Channel ID is required" });
  }

  const query = getQuery(event);
  const before = query.before as string | undefined;
  const limit = query.limit ? Number(query.limit) : undefined;

  return getMessagesByChannel(channelId, userId, { limit, before });
});
