import { db, generateId } from "../db";
import type { ChannelType } from "../db/tables";

// Permission bitmask
// 4 = manage_channels
const MANAGE_CHANNELS = 4;

export interface CreateChannelPayload {
  name: string;
  type?: ChannelType;
  topic?: string;
  description?: string;
  banner_url?: string;
  parent_id?: string;
  is_private?: boolean;
}

export interface ChannelItem {
  id: string;
  name: string;
  type: string;
  topic: string | null;
  description: string | null;
  banner_url: string | null;
  position: number;
  is_private: boolean;
  parent_id: string | null;
  last_message_at: Date | null;
  created_at: Date;
  message_count: number;
}

export interface ChannelListResult {
  channels: ChannelItem[];
  can_manage: boolean;
}

async function requireMembership(communityId: string, userId: string) {
  const membership = await db
    .selectFrom("community_members")
    .select("id")
    .where("community_id", "=", communityId)
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (!membership) {
    throw createError({ statusCode: 403, message: "You are not a member of this community" });
  }

  return membership;
}

async function checkCanManage(communityId: string, userId: string): Promise<boolean> {
  // Check if owner
  const community = await db
    .selectFrom("communities")
    .select("owner_id")
    .where("id", "=", communityId)
    .executeTakeFirst();

  if (!community) {
    throw createError({ statusCode: 404, message: "Community not found" });
  }

  if (community.owner_id === userId) return true;

  const membership = await db
    .selectFrom("community_members")
    .select("id")
    .where("community_id", "=", communityId)
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (!membership) return false;

  const roleRow = await db
    .selectFrom("member_roles as mr")
    .innerJoin("roles as r", "r.id", "mr.role_id")
    .select("r.permissions")
    .where("mr.member_id", "=", membership.id)
    .where("r.community_id", "=", communityId)
    .execute();

  return roleRow.some((r) => ((r.permissions as number) & MANAGE_CHANNELS) !== 0);
}

export async function getChannelsByCommunity(
  communityId: string,
  userId: string
): Promise<ChannelListResult> {
  await requireMembership(communityId, userId);
  const canManage = await checkCanManage(communityId, userId);

  const rows = await db
    .selectFrom("channels as c")
    .select([
      "c.id",
      "c.name",
      "c.type",
      "c.topic",
      "c.description",
      "c.banner_url",
      "c.position",
      "c.is_private",
      "c.parent_id",
      "c.last_message_at",
      "c.created_at"
    ])
    .select(
      db
        .selectFrom("messages")
        .select(db.fn.countAll().as("count"))
        .whereRef("messages.channel_id", "=", "c.id")
        .as("message_count")
    )
    .where("c.community_id", "=", communityId)
    .orderBy("c.position", "asc")
    .orderBy("c.created_at", "asc")
    .execute();

  return {
    channels: rows.map((r) => ({
      ...r,
      position: r.position,
      message_count: Number(r.message_count) || 0,
      is_private: r.is_private
    })),
    can_manage: canManage
  };
}

export async function createChannel(
  communityId: string,
  userId: string,
  payload: CreateChannelPayload
): Promise<ChannelItem> {
  const canManage = await checkCanManage(communityId, userId);
  if (!canManage) {
    throw createError({ statusCode: 403, message: "You don't have permission to create channels" });
  }

  if (payload.parent_id) {
    const parent = await db
      .selectFrom("channels")
      .select(["id", "type"])
      .where("id", "=", payload.parent_id)
      .where("community_id", "=", communityId)
      .executeTakeFirst();

    if (!parent || parent.type !== "category") {
      throw createError({
        statusCode: 400,
        message: "Parent must be a category channel in the same community"
      });
    }
  }

  const maxPos = await db
    .selectFrom("channels")
    .select(db.fn.max("position").as("max_pos"))
    .where("community_id", "=", communityId)
    .executeTakeFirst();

  const position = ((maxPos?.max_pos as number) ?? -1) + 1;

  const id = generateId();
  await db
    .insertInto("channels")
    .values({
      id,
      community_id: communityId,
      name: payload.name,
      type: payload.type ?? "text",
      topic: payload.topic ?? null,
      description: payload.description ?? null,
      banner_url: payload.banner_url ?? null,
      parent_id: payload.parent_id ?? null,
      is_private: payload.is_private ?? false,
      position
    })
    .execute();

  const channel = await db
    .selectFrom("channels")
    .select([
      "id",
      "name",
      "type",
      "topic",
      "description",
      "banner_url",
      "position",
      "is_private",
      "parent_id",
      "last_message_at",
      "created_at"
    ])
    .where("id", "=", id)
    .executeTakeFirstOrThrow();

  return {
    ...channel,
    position: channel.position,
    is_private: channel.is_private
  };
}
