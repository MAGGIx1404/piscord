import { getOrCreateConversation } from "../../../services/dmService";
import { areFriends } from "../../../services/friendService";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const { friendId } = await readBody<{ friendId: string }>(event);

  if (!friendId) {
    throw createError({ statusCode: 400, message: "friendId is required" });
  }

  // Verify friendship
  const friends = await areFriends(userId, friendId);
  if (!friends) {
    throw createError({ statusCode: 403, message: "You must be friends to start a conversation" });
  }

  const conversation = await getOrCreateConversation(userId, friendId);
  return { conversation };
});
