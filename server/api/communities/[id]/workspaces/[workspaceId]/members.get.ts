import { db } from "../../../../../db";
import { resolveCommunityId } from "../../../../../utils/community";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const slugOrId = getRouterParam(event, "id");
  const workspaceId = getRouterParam(event, "workspaceId");

  if (!slugOrId) throw createError({ statusCode: 400, message: "Community ID is required" });
  if (!workspaceId) throw createError({ statusCode: 400, message: "Workspace ID is required" });

  const communityId = await resolveCommunityId(slugOrId);

  // Verify user is a member
  const membership = await db
    .selectFrom("community_members")
    .select("id")
    .where("community_id", "=", communityId)
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (!membership) {
    throw createError({ statusCode: 403, message: "Not a member of this community" });
  }

  const members = await db
    .selectFrom("community_members as cm")
    .innerJoin("users as u", "u.id", "cm.user_id")
    .select(["u.id", "u.username", "u.avatar_url"])
    .where("cm.community_id", "=", communityId)
    .orderBy("u.username", "asc")
    .execute();

  return members;
});
