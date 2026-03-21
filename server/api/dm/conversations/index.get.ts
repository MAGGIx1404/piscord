import { getConversations } from "../../../services/dmService";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const conversations = await getConversations(userId);
  return { conversations };
});
