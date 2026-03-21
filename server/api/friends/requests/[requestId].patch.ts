import { acceptFriendRequest, declineFriendRequest } from "../../../services/friendService";
import { broadcastToUser } from "../../../routes/_ws";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const requestId = getRouterParam(event, "requestId");

  if (!requestId) {
    throw createError({ statusCode: 400, message: "Request ID is required" });
  }

  const { action } = await readBody<{ action: "accept" | "decline" }>(event);

  if (action === "accept") {
    const updated = await acceptFriendRequest(requestId, userId);

    // Notify the sender that their request was accepted
    broadcastToUser(updated.sender_id, {
      type: "friend:accepted",
      userId
    });

    return { request: updated };
  } else if (action === "decline") {
    await declineFriendRequest(requestId, userId);
    return { success: true };
  } else {
    throw createError({ statusCode: 400, message: "Invalid action. Use 'accept' or 'decline'" });
  }
});
