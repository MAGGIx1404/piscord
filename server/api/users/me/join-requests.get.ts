import { db } from "../../../db";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);

  const rows = await db
    .selectFrom("community_join_requests as jr")
    .innerJoin("communities as c", "c.id", "jr.community_id")
    .select([
      "jr.id",
      "jr.status",
      "jr.created_at",
      "jr.updated_at",
      "jr.reviewed_at",
      "jr.notified_at",
      "c.id as community_id",
      "c.name as community_name",
      "c.slug as community_slug",
      "c.icon_url as community_icon"
    ])
    .where("jr.user_id", "=", userId)
    .orderBy("jr.updated_at", "desc")
    .execute();

  const unreadCount = rows.filter(
    (r) => (r.status === "approved" || r.status === "rejected") && !r.notified_at
  ).length;

  return { requests: rows, unreadCount };
});
