import { getMessages } from "../../../../../services/dmService";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const conversationId = getRouterParam(event, "conversationId");

  if (!conversationId) {
    throw createError({ statusCode: 400, message: "Conversation ID is required" });
  }

  const query = getQuery(event);
  const limit = query.limit ? Number(query.limit) : undefined;
  const before = (query.before as string) || undefined;

  return await getMessages(conversationId, userId, { limit, before });
});
