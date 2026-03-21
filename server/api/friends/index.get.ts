import { getFriends } from "../../services/friendService";
import { isUserOnline } from "../../routes/_ws";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const friends = await getFriends(userId);

  return {
    friends: friends.map((f) => ({
      ...f,
      is_online: isUserOnline(f.id)
    }))
  };
});
