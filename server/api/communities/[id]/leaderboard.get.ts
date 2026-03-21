import { createError, getRouterParam } from "h3";
import { db } from "../../../db";
import { sql } from "kysely";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const communityId = getRouterParam(event, "id");

  if (!communityId) {
    throw createError({ statusCode: 400, message: "Community ID is required" });
  }

  // Check membership
  const membership = await db
    .selectFrom("community_members")
    .select("id")
    .where("community_id", "=", communityId)
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (!membership) {
    throw createError({ statusCode: 403, message: "Not a member of this community" });
  }

  // Get community channels for filtering messages
  const channelIds = await db
    .selectFrom("channels")
    .select("id")
    .where("community_id", "=", communityId)
    .execute();

  if (channelIds.length === 0) {
    return { leaderboard: [] };
  }

  const ids = channelIds.map((c) => c.id);

  // Count messages per user in this community's channels (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const rows = await db
    .selectFrom("messages as m")
    .innerJoin("users as u", "u.id", "m.author_id")
    .select(["u.id", "u.username", "u.avatar_url", sql<number>`count(m.id)`.as("message_count")])
    .where("m.channel_id", "in", ids)
    .where("m.created_at", ">=", thirtyDaysAgo)
    .groupBy(["u.id", "u.username", "u.avatar_url"])
    .orderBy("message_count", "desc")
    .limit(10)
    .execute();

  // Get community owner for role display
  const community = await db
    .selectFrom("communities")
    .select("owner_id")
    .where("id", "=", communityId)
    .executeTakeFirst();

  const leaderboard = rows.map((r) => {
    let role = "Member";
    if (community && r.id === community.owner_id) {
      role = "Owner";
    }
    return {
      id: r.id,
      name: r.username,
      avatar: r.avatar_url ?? "",
      role,
      score: Number(r.message_count)
    };
  });

  return { leaderboard };
});
