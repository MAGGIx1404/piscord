import { db } from "../../../../db";

const MANAGE_CHANNELS = 4;

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const channelId = getRouterParam(event, "channelId");

  if (!channelId) {
    throw createError({ statusCode: 400, message: "Channel ID is required" });
  }

  // Get the channel's community
  const channel = await db
    .selectFrom("channels")
    .select(["id", "community_id"])
    .where("id", "=", channelId)
    .executeTakeFirst();

  if (!channel) {
    throw createError({ statusCode: 404, message: "Channel not found" });
  }

  // Check membership
  const membership = await db
    .selectFrom("community_members")
    .select("id")
    .where("community_id", "=", channel.community_id)
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (!membership) {
    throw createError({ statusCode: 403, message: "Not a member of this community" });
  }

  // Get all members of the community
  const members = await db
    .selectFrom("community_members as cm")
    .innerJoin("users as u", "u.id", "cm.user_id")
    .select(["u.id", "u.username", "u.avatar_url"])
    .where("cm.community_id", "=", channel.community_id)
    .orderBy("u.username", "asc")
    .execute();

  // Get community info (AI agent + owner)
  const community = await db
    .selectFrom("communities")
    .select([
      "owner_id",
      "is_ai_pet",
      "ai_agent_name",
      "ai_agent_pet_name",
      "ai_agent_avatar",
      "ai_agent_description"
    ])
    .where("id", "=", channel.community_id)
    .executeTakeFirst();

  // Check if user can manage (owner or has manage_channels permission)
  let canManage = false;
  if (community?.owner_id === userId) {
    canManage = true;
  } else {
    const roleRows = await db
      .selectFrom("member_roles as mr")
      .innerJoin("roles as r", "r.id", "mr.role_id")
      .select("r.permissions")
      .where("mr.member_id", "=", membership.id)
      .where("r.community_id", "=", channel.community_id)
      .execute();

    canManage = roleRows.some((r) => ((r.permissions as number) & MANAGE_CHANNELS) !== 0);
  }

  return {
    members,
    can_manage: canManage,
    ai_agent: community?.is_ai_pet
      ? {
          name: community.ai_agent_name,
          pet_name: community.ai_agent_pet_name,
          avatar: community.ai_agent_avatar,
          description: community.ai_agent_description
        }
      : null
  };
});
