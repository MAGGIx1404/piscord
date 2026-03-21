import { db, generateId } from "../db";
import type { MessageType } from "../db/tables";

// ─── Permission bitmask ─────────────────────────────────────────────────────
const SEND_MESSAGES = 2;

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CreateMessagePayload {
  content: string;
  reply_to_id?: string;
  type?: MessageType;
}

export interface MessageAuthor {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface ReactionGroup {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface MessageItem {
  id: string;
  channel_id: string;
  author: MessageAuthor;
  content: string | null;
  type: string;
  reply_to_id: string | null;
  is_edited: boolean;
  is_pinned: boolean;
  reactions: ReactionGroup[];
  created_at: Date;
  updated_at: Date;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function requireChannelMembership(channelId: string, userId: string) {
  // Get the channel's community
  const channel = await db
    .selectFrom("channels")
    .select(["id", "community_id"])
    .where("id", "=", channelId)
    .executeTakeFirst();

  if (!channel) {
    throw createError({ statusCode: 404, message: "Channel not found" });
  }

  // Check community membership
  const membership = await db
    .selectFrom("community_members")
    .select("id")
    .where("community_id", "=", channel.community_id)
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (!membership) {
    throw createError({ statusCode: 403, message: "You are not a member of this community" });
  }

  return { channel, membership };
}

async function checkCanSend(communityId: string, userId: string): Promise<boolean> {
  const community = await db
    .selectFrom("communities")
    .select("owner_id")
    .where("id", "=", communityId)
    .executeTakeFirst();

  if (community?.owner_id === userId) return true;

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

  // Default role allows sending; only block if explicitly restricted
  if (roleRow.length === 0) return true;
  return roleRow.some((r) => ((r.permissions as number) & SEND_MESSAGES) !== 0);
}

async function buildMessageItems(
  rows: Array<{
    id: string;
    channel_id: string;
    author_id: string;
    content: string | null;
    type: string;
    reply_to_id: string | null;
    is_edited: boolean;
    is_pinned: boolean;
    created_at: Date;
    updated_at: Date;
    author_username: string;
    author_avatar: string | null;
  }>,
  currentUserId: string
): Promise<MessageItem[]> {
  if (rows.length === 0) return [];

  const messageIds = rows.map((r) => r.id);

  // Fetch reactions for all messages
  const reactions = await db
    .selectFrom("reactions")
    .select(["message_id", "emoji", "user_id"])
    .where("message_id", "in", messageIds)
    .execute();

  // Group reactions by message
  const reactionMap = new Map<string, Map<string, { count: number; reacted: boolean }>>();
  for (const r of reactions) {
    if (!reactionMap.has(r.message_id)) {
      reactionMap.set(r.message_id, new Map());
    }
    const msgReactions = reactionMap.get(r.message_id)!;
    if (!msgReactions.has(r.emoji)) {
      msgReactions.set(r.emoji, { count: 0, reacted: false });
    }
    const group = msgReactions.get(r.emoji)!;
    group.count++;
    if (r.user_id === currentUserId) group.reacted = true;
  }

  return rows.map((r) => {
    const msgReactions = reactionMap.get(r.id);
    const reactionGroups: ReactionGroup[] = [];
    if (msgReactions) {
      for (const [emoji, data] of msgReactions) {
        reactionGroups.push({ emoji, ...data });
      }
    }

    return {
      id: r.id,
      channel_id: r.channel_id,
      author: {
        id: r.author_id,
        username: r.author_username,
        avatar_url: r.author_avatar
      },
      content: r.content,
      type: r.type,
      reply_to_id: r.reply_to_id,
      is_edited: r.is_edited as boolean,
      is_pinned: r.is_pinned as boolean,
      reactions: reactionGroups,
      created_at: r.created_at,
      updated_at: r.updated_at
    };
  });
}

// ─── Get messages by channel ────────────────────────────────────────────────

export async function getMessagesByChannel(
  channelId: string,
  userId: string,
  options: { limit?: number; before?: string } = {}
): Promise<{ messages: MessageItem[]; has_more: boolean }> {
  await requireChannelMembership(channelId, userId);

  const limit = Math.min(options.limit || 50, 100);

  let query = db
    .selectFrom("messages as m")
    .innerJoin("users as u", "u.id", "m.author_id")
    .select([
      "m.id",
      "m.channel_id",
      "m.author_id",
      "m.content",
      "m.type",
      "m.reply_to_id",
      "m.is_edited",
      "m.is_pinned",
      "m.created_at",
      "m.updated_at",
      "u.username as author_username",
      "u.avatar_url as author_avatar"
    ])
    .where("m.channel_id", "=", channelId);

  if (options.before) {
    query = query.where("m.id", "<", options.before);
  }

  const rows = await query
    .orderBy("m.created_at", "desc")
    .limit(limit + 1)
    .execute();

  const hasMore = rows.length > limit;
  const trimmed = rows.slice(0, limit).reverse();

  const messages = await buildMessageItems(
    trimmed as Parameters<typeof buildMessageItems>[0],
    userId
  );

  return { messages, has_more: hasMore };
}

// ─── Create message ─────────────────────────────────────────────────────────

export async function createMessage(
  channelId: string,
  userId: string,
  payload: CreateMessagePayload
): Promise<MessageItem> {
  const { channel } = await requireChannelMembership(channelId, userId);

  const canSend = await checkCanSend(channel.community_id, userId);
  if (!canSend) {
    throw createError({ statusCode: 403, message: "You don't have permission to send messages" });
  }

  if (!payload.content?.trim()) {
    throw createError({ statusCode: 400, message: "Message content is required" });
  }

  // Validate reply_to_id if provided
  if (payload.reply_to_id) {
    const parent = await db
      .selectFrom("messages")
      .select("id")
      .where("id", "=", payload.reply_to_id)
      .where("channel_id", "=", channelId)
      .executeTakeFirst();

    if (!parent) {
      throw createError({ statusCode: 400, message: "Reply target message not found" });
    }
  }

  const id = generateId();
  await db
    .insertInto("messages")
    .values({
      id,
      channel_id: channelId,
      author_id: userId,
      content: payload.content,
      type: payload.type ?? "default",
      reply_to_id: payload.reply_to_id ?? null
    })
    .execute();

  // Update channel's last_message_at
  await db
    .updateTable("channels")
    .set({ last_message_at: new Date() })
    .where("id", "=", channelId)
    .execute();

  // Fetch the created message with author info
  const row = await db
    .selectFrom("messages as m")
    .innerJoin("users as u", "u.id", "m.author_id")
    .select([
      "m.id",
      "m.channel_id",
      "m.author_id",
      "m.content",
      "m.type",
      "m.reply_to_id",
      "m.is_edited",
      "m.is_pinned",
      "m.created_at",
      "m.updated_at",
      "u.username as author_username",
      "u.avatar_url as author_avatar"
    ])
    .where("m.id", "=", id)
    .executeTakeFirstOrThrow();

  const messages = await buildMessageItems(
    [row as Parameters<typeof buildMessageItems>[0][0]],
    userId
  );

  return messages[0]!;
}

// ─── Create AI message (no permission check — system-inserted) ──────────────

export async function createAIMessage(
  channelId: string,
  botUserId: string,
  content: string,
  replyToId?: string
): Promise<MessageItem> {
  const id = generateId();
  await db
    .insertInto("messages")
    .values({
      id,
      channel_id: channelId,
      author_id: botUserId,
      content,
      type: "ai",
      reply_to_id: replyToId ?? null
    })
    .execute();

  const row = await db
    .selectFrom("messages as m")
    .innerJoin("users as u", "u.id", "m.author_id")
    .select([
      "m.id",
      "m.channel_id",
      "m.author_id",
      "m.content",
      "m.type",
      "m.reply_to_id",
      "m.is_edited",
      "m.is_pinned",
      "m.created_at",
      "m.updated_at",
      "u.username as author_username",
      "u.avatar_url as author_avatar"
    ])
    .where("m.id", "=", id)
    .executeTakeFirstOrThrow();

  const messages = await buildMessageItems(
    [row as Parameters<typeof buildMessageItems>[0][0]],
    botUserId
  );

  return messages[0]!;
}

// ─── Toggle reaction ────────────────────────────────────────────────────────

export async function toggleReaction(
  messageId: string,
  userId: string,
  emoji: string
): Promise<{ added: boolean; reactions: ReactionGroup[] }> {
  // Check the message exists and user has access
  const message = await db
    .selectFrom("messages")
    .select(["id", "channel_id"])
    .where("id", "=", messageId)
    .executeTakeFirst();

  if (!message) {
    throw createError({ statusCode: 404, message: "Message not found" });
  }

  await requireChannelMembership(message.channel_id, userId);

  // Check if reaction exists
  const existing = await db
    .selectFrom("reactions")
    .select("id")
    .where("message_id", "=", messageId)
    .where("user_id", "=", userId)
    .where("emoji", "=", emoji)
    .executeTakeFirst();

  let added: boolean;
  if (existing) {
    await db.deleteFrom("reactions").where("id", "=", existing.id).execute();
    added = false;
  } else {
    await db
      .insertInto("reactions")
      .values({
        id: generateId(),
        message_id: messageId,
        user_id: userId,
        emoji
      })
      .execute();
    added = true;
  }

  // Get updated reactions for this message
  const allReactions = await db
    .selectFrom("reactions")
    .select(["emoji", "user_id"])
    .where("message_id", "=", messageId)
    .execute();

  const groups = new Map<string, ReactionGroup>();
  for (const r of allReactions) {
    if (!groups.has(r.emoji)) {
      groups.set(r.emoji, { emoji: r.emoji, count: 0, reacted: false });
    }
    const g = groups.get(r.emoji)!;
    g.count++;
    if (r.user_id === userId) g.reacted = true;
  }

  return { added, reactions: Array.from(groups.values()) };
}

// ─── Parse @mentions from message content ───────────────────────────────────

export function parseMentions(content: string): string[] {
  const matches = content.match(/@(\w+)/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.slice(1)))];
}

// ─── Resolve mention usernames to user IDs ──────────────────────────────────

export async function resolveMentionUserIds(
  usernames: string[],
  communityId: string
): Promise<{ userId: string; username: string }[]> {
  if (usernames.length === 0) return [];

  const rows = await db
    .selectFrom("users as u")
    .innerJoin("community_members as cm", "cm.user_id", "u.id")
    .select(["u.id as userId", "u.username"])
    .where("cm.community_id", "=", communityId)
    .where("u.username", "in", usernames)
    .execute();

  return rows;
}

// ─── Get a single message by ID ─────────────────────────────────────────────

export async function getMessageById(
  messageId: string,
  userId: string
): Promise<MessageItem | null> {
  const row = await db
    .selectFrom("messages as m")
    .innerJoin("users as u", "u.id", "m.author_id")
    .select([
      "m.id",
      "m.channel_id",
      "m.author_id",
      "m.content",
      "m.type",
      "m.reply_to_id",
      "m.is_edited",
      "m.is_pinned",
      "m.created_at",
      "m.updated_at",
      "u.username as author_username",
      "u.avatar_url as author_avatar"
    ])
    .where("m.id", "=", messageId)
    .executeTakeFirst();

  if (!row) return null;

  const messages = await buildMessageItems(
    [row as Parameters<typeof buildMessageItems>[0][0]],
    userId
  );

  return messages[0] ?? null;
}
