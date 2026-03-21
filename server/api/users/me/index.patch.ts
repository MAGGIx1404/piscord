import { updateCurrentUser } from "../../../services/userService";

/**
 * PATCH /api/users/me
 * Body: { username?, avatar_url? }
 */
export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const body = await readBody<{ username?: string; avatar_url?: string }>(event);

  const user = await updateCurrentUser(userId, {
    username: body?.username?.trim(),
    avatar_url: body?.avatar_url?.trim()
  });

  return { user };
});
