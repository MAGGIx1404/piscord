import { db } from "../../../db";

/**
 * GET /api/users/me/communities
 * Returns communities the authenticated user is a member of.
 * Supports search (?search=) and pagination (?limit=&offset=).
 */
export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const query = getQuery(event);

  const search = (query.search as string) || "";
  const limit = Math.min(Math.max(Number(query.limit) || 18, 1), 50);
  const offset = Math.max(Number(query.offset) || 0, 0);

  let baseQuery = db
    .selectFrom("community_members as cm")
    .innerJoin("communities as c", "c.id", "cm.community_id")
    .where("cm.user_id", "=", userId);

  if (search) {
    baseQuery = baseQuery.where("c.name", "ilike", `%${search}%`);
  }

  const [rows, countRow] = await Promise.all([
    baseQuery
      .select([
        "c.id",
        "c.name",
        "c.slug",
        "c.description",
        "c.icon_url",
        "c.banner_url",
        "c.category",
        "c.member_count",
        "c.is_public",
        "c.require_approval",
        "c.owner_id",
        "cm.joined_at"
      ])
      .orderBy("cm.joined_at", "desc")
      .limit(limit)
      .offset(offset)
      .execute(),

    baseQuery.select((eb) => eb.fn.countAll().as("count")).executeTakeFirstOrThrow()
  ]);

  const communities = rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    icon_url: r.icon_url,
    banner_url: r.banner_url,
    category: r.category,
    member_count: r.member_count,
    is_public: r.is_public,
    require_approval: r.require_approval,
    is_owner: r.owner_id === userId,
    joined_at: r.joined_at
  }));

  return {
    communities,
    total: Number(countRow.count),
    limit,
    offset
  };
});
