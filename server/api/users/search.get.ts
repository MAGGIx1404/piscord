import { searchUsers } from "../../services/friendService";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const query = getQuery(event);
  const q = (query.q as string) ?? "";

  if (q.length < 2) {
    return { users: [] };
  }

  const users = await searchUsers(q, userId);
  return { users };
});
