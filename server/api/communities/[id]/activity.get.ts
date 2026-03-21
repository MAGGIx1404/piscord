import { db } from "../../../db";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const communityId = getRouterParam(event, "id");

  if (!communityId) {
    throw createError({ statusCode: 400, message: "Community ID is required" });
  }

  const community = await db
    .selectFrom("communities")
    .select(["id", "owner_id", "require_approval"])
    .where("id", "=", communityId)
    .executeTakeFirst();

  if (!community) {
    throw createError({ statusCode: 404, message: "Community not found" });
  }

  const isOwner = community.owner_id === userId;

  const recentJoins = await db
    .selectFrom("community_members as cm")
    .innerJoin("users as u", "u.id", "cm.user_id")
    .select(["cm.id", "cm.user_id", "cm.joined_at", "u.username", "u.avatar_url"])
    .where("cm.community_id", "=", communityId)
    .orderBy("cm.joined_at", "desc")
    .limit(10)
    .execute();

  const joinRequests =
    isOwner && community.require_approval
      ? await db
          .selectFrom("community_join_requests as jr")
          .innerJoin("users as u", "u.id", "jr.user_id")
          .select([
            "jr.id",
            "jr.status",
            "jr.note",
            "jr.created_at",
            "jr.user_id",
            "u.username",
            "u.avatar_url"
          ])
          .where("jr.community_id", "=", communityId)
          .where("jr.status", "=", "pending")
          .orderBy("jr.created_at", "asc")
          .execute()
      : [];

  return {
    recentActivity: recentJoins,
    joinRequests,
    isOwner,
    requireApproval: community.require_approval
  };
});
