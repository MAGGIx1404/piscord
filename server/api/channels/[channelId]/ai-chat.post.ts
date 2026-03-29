import { db } from "../../../db";
import { handleChannelAI } from "../../../services/channelAIService";
import { createAIMessage } from "../../../services/messageService";
import { broadcastToChannel } from "../../../routes/_ws";

const MANAGE_CHANNELS = 4;

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const channelId = getRouterParam(event, "channelId");

  if (!channelId) {
    throw createError({ statusCode: 400, message: "Channel ID is required" });
  }

  const body = await readBody(event);
  const { content, replyToId } = body as { content: string; replyToId?: string };

  if (!content?.trim()) {
    throw createError({ statusCode: 400, message: "Content is required" });
  }

  const channel = await db
    .selectFrom("channels")
    .select(["id", "community_id"])
    .where("id", "=", channelId)
    .executeTakeFirst();

  if (!channel) {
    throw createError({ statusCode: 404, message: "Channel not found" });
  }

  const membership = await db
    .selectFrom("community_members")
    .select("id")
    .where("community_id", "=", channel.community_id)
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (!membership) {
    throw createError({ statusCode: 403, message: "Not a member of this community" });
  }

  const community = await db
    .selectFrom("communities")
    .select(["id", "name", "owner_id", "is_ai_pet", "ai_agent_name", "ai_agent_description"])
    .where("id", "=", channel.community_id)
    .executeTakeFirst();

  if (!community?.is_ai_pet || !community.ai_agent_name) {
    throw createError({ statusCode: 400, message: "AI agent is not enabled for this community" });
  }

  let canManage = community.owner_id === userId;
  if (!canManage) {
    const roleRows = await db
      .selectFrom("member_roles as mr")
      .innerJoin("roles as r", "r.id", "mr.role_id")
      .select("r.permissions")
      .where("mr.member_id", "=", membership.id)
      .where("r.community_id", "=", channel.community_id)
      .execute();

    canManage = roleRows.some((r) => ((r.permissions as number) & MANAGE_CHANNELS) !== 0);
  }

  const result = await handleChannelAI(
    content.trim(),
    {
      name: community.ai_agent_name,
      description: community.ai_agent_description ?? null,
      communityName: community.name,
      canManage
    },
    channel.community_id,
    channelId,
    userId
  );

  const aiMessage = await createAIMessage(channelId, userId, result.content, replyToId);

  broadcastToChannel(channelId, {
    type: "message:new",
    message: aiMessage
  });

  return { message: aiMessage, toolResults: result.toolResults };
});
