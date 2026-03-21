import { removeFriend } from "../../services/friendService";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const friendId = getRouterParam(event, "friendId");

  if (!friendId) {
    throw createError({ statusCode: 400, message: "Friend ID is required" });
  }

  await removeFriend(friendId, userId);
  return { success: true };
});
