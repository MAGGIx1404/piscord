import { cancelFriendRequest } from "../../../services/friendService";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const requestId = getRouterParam(event, "requestId");

  if (!requestId) {
    throw createError({ statusCode: 400, message: "Request ID is required" });
  }

  await cancelFriendRequest(requestId, userId);
  return { success: true };
});
