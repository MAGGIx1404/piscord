import { sendFriendRequest } from "../../../services/friendService";
import { broadcastToUser } from "../../../routes/_ws";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const { receiverId } = await readBody<{ receiverId: string }>(event);

  if (!receiverId) {
    throw createError({ statusCode: 400, message: "receiverId is required" });
  }

  const request = await sendFriendRequest(userId, receiverId);

  // Real-time notification to receiver
  broadcastToUser(receiverId, {
    type: "friend:request",
    request: {
      id: request.id,
      user_id: userId,
      username: request.sender_username,
      avatar_url: request.sender_avatar_url,
      created_at: request.created_at
    }
  });

  return { request };
});
