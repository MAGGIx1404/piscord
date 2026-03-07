import { getCurrentUser } from "../../../services/userService";

/**
 * GET /api/users/me
 * Returns the authenticated user's public profile.
 */
export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const user = await getCurrentUser(userId);
  return { user };
});
