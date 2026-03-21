import { db } from "../../../db";

/**
 * PATCH /api/users/me/join-requests
 * Marks all actioned (approved / rejected) join requests as notified so the
 * bell-badge count goes back to zero.
 */
export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);

  await db
    .updateTable("community_join_requests")
    .set({ notified_at: new Date() })
    .where("user_id", "=", userId)
    .where((eb) => eb("status", "in", ["approved", "rejected"]))
    .where("notified_at", "is", null)
    .execute();

  return { ok: true };
});
