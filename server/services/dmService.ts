import { db, generateId } from "../db";
import { areFriends } from "./friendService";

export async function getOrCreateConversation(userId1: string, userId2: string) {
  // Canonical ordering: lower ID = user1
  const [user1_id, user2_id] = [userId1, userId2].sort();

  const existing = await db
    .selectFrom("dm_conversations")
    .selectAll()
    .where("user1_id", "=", user1_id)
    .where("user2_id", "=", user2_id)
    .executeTakeFirst();

  if (existing) return existing;

  const id = generateId();
  return await db
    .insertInto("dm_conversations")
    .values({ id, user1_id, user2_id })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function getConversations(userId: string) {
  const rows = await db
    .selectFrom("dm_conversations as dc")
    .innerJoin("users as u1", "u1.id", "dc.user1_id")
    .innerJoin("users as u2", "u2.id", "dc.user2_id")
    .select([
      "dc.id",
      "dc.user1_id",
      "dc.user2_id",
      "dc.last_message_at",
      "dc.created_at",
      "u1.username as user1_username",
      "u1.avatar_url as user1_avatar_url",
      "u2.username as user2_username",
      "u2.avatar_url as user2_avatar_url"
    ])
    .where((eb) => eb.or([eb("dc.user1_id", "=", userId), eb("dc.user2_id", "=", userId)]))
    .where("dc.last_message_at", "is not", null)
    .orderBy("dc.last_message_at", "desc")
    .execute();

  // Fetch last message for each conversation
  const conversations = await Promise.all(
    rows.map(async (r) => {
      const lastMsg = await db
        .selectFrom("dm_messages")
        .select(["content", "sender_id", "created_at"])
        .where("conversation_id", "=", r.id)
        .orderBy("created_at", "desc")
        .limit(1)
        .executeTakeFirst();

      const isUser1 = r.user1_id === userId;
      return {
        id: r.id,
        otherUser: {
          id: isUser1 ? r.user2_id : r.user1_id,
          username: isUser1 ? r.user2_username : r.user1_username,
          avatar_url: isUser1 ? r.user2_avatar_url : r.user1_avatar_url
        },
        lastMessage: lastMsg
          ? {
              content: lastMsg.content,
              sender_id: lastMsg.sender_id,
              created_at: lastMsg.created_at
            }
          : null,
        created_at: r.created_at
      };
    })
  );

  return conversations;
}

export async function getMessages(
  conversationId: string,
  userId: string,
  options: { limit?: number; before?: string } = {}
) {
  // Verify participant
  const conversation = await db
    .selectFrom("dm_conversations")
    .selectAll()
    .where("id", "=", conversationId)
    .executeTakeFirst();

  if (!conversation) {
    throw createError({ statusCode: 404, message: "Conversation not found" });
  }
  if (conversation.user1_id !== userId && conversation.user2_id !== userId) {
    throw createError({ statusCode: 403, message: "Not a participant" });
  }

  const limit = Math.min(options.limit ?? 50, 100);

  let query = db
    .selectFrom("dm_messages as m")
    .innerJoin("users as u", "u.id", "m.sender_id")
    .select([
      "m.id",
      "m.conversation_id",
      "m.content",
      "m.is_edited",
      "m.created_at",
      "m.updated_at",
      "u.id as sender_id",
      "u.username as sender_username",
      "u.avatar_url as sender_avatar_url"
    ])
    .where("m.conversation_id", "=", conversationId)
    .orderBy("m.created_at", "desc")
    .limit(limit + 1);

  if (options.before) {
    const beforeMsg = await db
      .selectFrom("dm_messages")
      .select("created_at")
      .where("id", "=", options.before)
      .executeTakeFirst();

    if (beforeMsg) {
      query = query.where("m.created_at", "<", beforeMsg.created_at);
    }
  }

  const rows = await query.execute();
  const has_more = rows.length > limit;
  const messages = rows.slice(0, limit).reverse();

  return {
    messages: messages.map((m) => ({
      id: m.id,
      conversation_id: m.conversation_id,
      sender: {
        id: m.sender_id,
        username: m.sender_username,
        avatar_url: m.sender_avatar_url
      },
      content: m.content,
      is_edited: m.is_edited,
      created_at: m.created_at,
      updated_at: m.updated_at
    })),
    has_more
  };
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  // Verify participant
  const conversation = await db
    .selectFrom("dm_conversations")
    .selectAll()
    .where("id", "=", conversationId)
    .executeTakeFirst();

  if (!conversation) {
    throw createError({ statusCode: 404, message: "Conversation not found" });
  }
  if (conversation.user1_id !== senderId && conversation.user2_id !== senderId) {
    throw createError({ statusCode: 403, message: "Not a participant" });
  }

  // Verify friendship
  const recipientId =
    conversation.user1_id === senderId ? conversation.user2_id : conversation.user1_id;
  const friends = await areFriends(senderId, recipientId);
  if (!friends) {
    throw createError({ statusCode: 403, message: "You must be friends to send messages" });
  }

  const id = generateId();
  await db
    .insertInto("dm_messages")
    .values({ id, conversation_id: conversationId, sender_id: senderId, content })
    .execute();

  // Update last_message_at
  await db
    .updateTable("dm_conversations")
    .set({ last_message_at: new Date() })
    .where("id", "=", conversationId)
    .execute();

  // Fetch the complete message with sender info
  const sender = await db
    .selectFrom("users")
    .select(["id", "username", "avatar_url"])
    .where("id", "=", senderId)
    .executeTakeFirstOrThrow();

  const message = await db
    .selectFrom("dm_messages")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirstOrThrow();

  return {
    message: {
      id: message.id,
      conversation_id: message.conversation_id,
      sender: {
        id: sender.id,
        username: sender.username,
        avatar_url: sender.avatar_url
      },
      content: message.content,
      is_edited: message.is_edited,
      created_at: message.created_at,
      updated_at: message.updated_at
    },
    recipientId
  };
}
