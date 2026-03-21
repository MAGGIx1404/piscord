import { db } from "../../../db";

/**
 * GET /api/users/me/communities
 * Returns all communities the authenticated user is a member of.
 */
export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);

  const rows = await db
    .selectFrom("community_members as cm")
    .innerJoin("communities as c", "c.id", "cm.community_id")
    .select([
      "c.id",
      "c.name",
      "c.slug",
      "c.icon_url",
      "c.member_count",
      "c.is_public",
      "c.owner_id",
      "cm.joined_at"
    ])
    .where("cm.user_id", "=", userId)
    .orderBy("cm.joined_at", "desc")
    .execute();

  const communities = rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    icon_url: r.icon_url,
    member_count: r.member_count,
    is_public: r.is_public,
    is_owner: r.owner_id === userId,
    joined_at: r.joined_at
  }));

  return { communities };
});
