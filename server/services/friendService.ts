import { db, generateId } from "../db";

export async function searchUsers(query: string, currentUserId: string) {
  const rows = await db
    .selectFrom("users as u")
    .leftJoin("friend_requests as fr", (join) =>
      join.on((eb) =>
        eb.or([
          eb.and([
            eb("fr.sender_id", "=", eb.ref("u.id")),
            eb("fr.receiver_id", "=", currentUserId)
          ]),
          eb.and([
            eb("fr.sender_id", "=", currentUserId),
            eb("fr.receiver_id", "=", eb.ref("u.id"))
          ])
        ])
      )
    )
    .select([
      "u.id",
      "u.username",
      "u.avatar_url",
      "fr.status as friendship_status",
      "fr.sender_id"
    ])
    .where("u.id", "!=", currentUserId)
    .where("u.username", "ilike", `%${query}%`)
    .limit(20)
    .execute();

  return rows.map((r) => ({
    id: r.id,
    username: r.username,
    avatar_url: r.avatar_url,
    friendship_status: r.friendship_status as string | null,
    is_incoming: r.sender_id !== null && r.sender_id !== currentUserId
  }));
}

export async function sendFriendRequest(senderId: string, receiverId: string) {
  if (senderId === receiverId) {
    throw createError({ statusCode: 400, message: "Cannot send friend request to yourself" });
  }

  // Check for existing request in either direction
  const existing = await db
    .selectFrom("friend_requests")
    .selectAll()
    .where((eb) =>
      eb.or([
        eb.and([eb("sender_id", "=", senderId), eb("receiver_id", "=", receiverId)]),
        eb.and([eb("sender_id", "=", receiverId), eb("receiver_id", "=", senderId)])
      ])
    )
    .where("status", "in", ["pending", "accepted"])
    .executeTakeFirst();

  if (existing) {
    if (existing.status === "accepted") {
      throw createError({ statusCode: 409, message: "You are already friends" });
    }
    throw createError({ statusCode: 409, message: "A pending friend request already exists" });
  }

  const id = generateId();
  const request = await db
    .insertInto("friend_requests")
    .values({ id, sender_id: senderId, receiver_id: receiverId, status: "pending" })
    .returningAll()
    .executeTakeFirstOrThrow();

  // Get sender username for notification data
  const sender = await db
    .selectFrom("users")
    .select(["username", "avatar_url"])
    .where("id", "=", senderId)
    .executeTakeFirstOrThrow();

  // Create notification
  await db
    .insertInto("notifications")
    .values({
      id: generateId(),
      user_id: receiverId,
      actor_id: senderId,
      type: "friend_request",
      entity_type: "friend_request",
      entity_id: id,
      data: { username: sender.username, avatar_url: sender.avatar_url }
    })
    .execute();

  return { ...request, sender_username: sender.username, sender_avatar_url: sender.avatar_url };
}

export async function acceptFriendRequest(requestId: string, userId: string) {
  const request = await db
    .selectFrom("friend_requests")
    .selectAll()
    .where("id", "=", requestId)
    .executeTakeFirst();

  if (!request) {
    throw createError({ statusCode: 404, message: "Friend request not found" });
  }
  if (request.receiver_id !== userId) {
    throw createError({ statusCode: 403, message: "Not authorized" });
  }
  if (request.status !== "pending") {
    throw createError({ statusCode: 400, message: "Request is no longer pending" });
  }

  const updated = await db
    .updateTable("friend_requests")
    .set({ status: "accepted" })
    .where("id", "=", requestId)
    .returningAll()
    .executeTakeFirstOrThrow();

  // Get acceptor username for notification
  const acceptor = await db
    .selectFrom("users")
    .select(["username", "avatar_url"])
    .where("id", "=", userId)
    .executeTakeFirstOrThrow();

  // Notify the original sender
  await db
    .insertInto("notifications")
    .values({
      id: generateId(),
      user_id: request.sender_id,
      actor_id: userId,
      type: "friend_accepted",
      entity_type: "friend_request",
      entity_id: requestId,
      data: { username: acceptor.username, avatar_url: acceptor.avatar_url }
    })
    .execute();

  return updated;
}

export async function declineFriendRequest(requestId: string, userId: string) {
  const request = await db
    .selectFrom("friend_requests")
    .selectAll()
    .where("id", "=", requestId)
    .executeTakeFirst();

  if (!request) {
    throw createError({ statusCode: 404, message: "Friend request not found" });
  }
  if (request.receiver_id !== userId) {
    throw createError({ statusCode: 403, message: "Not authorized" });
  }
  if (request.status !== "pending") {
    throw createError({ statusCode: 400, message: "Request is no longer pending" });
  }

  await db
    .updateTable("friend_requests")
    .set({ status: "declined" })
    .where("id", "=", requestId)
    .execute();
}

export async function cancelFriendRequest(requestId: string, userId: string) {
  const request = await db
    .selectFrom("friend_requests")
    .selectAll()
    .where("id", "=", requestId)
    .executeTakeFirst();

  if (!request) {
    throw createError({ statusCode: 404, message: "Friend request not found" });
  }
  if (request.sender_id !== userId) {
    throw createError({ statusCode: 403, message: "Not authorized" });
  }
  if (request.status !== "pending") {
    throw createError({ statusCode: 400, message: "Request is no longer pending" });
  }

  await db.deleteFrom("friend_requests").where("id", "=", requestId).execute();
}

export async function removeFriend(friendId: string, userId: string) {
  const request = await db
    .selectFrom("friend_requests")
    .selectAll()
    .where((eb) =>
      eb.or([
        eb.and([eb("sender_id", "=", userId), eb("receiver_id", "=", friendId)]),
        eb.and([eb("sender_id", "=", friendId), eb("receiver_id", "=", userId)])
      ])
    )
    .where("status", "=", "accepted")
    .executeTakeFirst();

  if (!request) {
    throw createError({ statusCode: 404, message: "Friendship not found" });
  }

  await db.deleteFrom("friend_requests").where("id", "=", request.id).execute();
}

export async function getFriends(userId: string) {
  // Friends where user is sender
  const asSender = await db
    .selectFrom("friend_requests as fr")
    .innerJoin("users as u", "u.id", "fr.receiver_id")
    .select(["u.id", "u.username", "u.avatar_url", "fr.id as request_id", "fr.created_at"])
    .where("fr.sender_id", "=", userId)
    .where("fr.status", "=", "accepted")
    .execute();

  // Friends where user is receiver
  const asReceiver = await db
    .selectFrom("friend_requests as fr")
    .innerJoin("users as u", "u.id", "fr.sender_id")
    .select(["u.id", "u.username", "u.avatar_url", "fr.id as request_id", "fr.created_at"])
    .where("fr.receiver_id", "=", userId)
    .where("fr.status", "=", "accepted")
    .execute();

  return [...asSender, ...asReceiver].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getPendingRequests(userId: string) {
  const incoming = await db
    .selectFrom("friend_requests as fr")
    .innerJoin("users as u", "u.id", "fr.sender_id")
    .select(["fr.id", "u.id as user_id", "u.username", "u.avatar_url", "fr.created_at"])
    .where("fr.receiver_id", "=", userId)
    .where("fr.status", "=", "pending")
    .orderBy("fr.created_at", "desc")
    .execute();

  const outgoing = await db
    .selectFrom("friend_requests as fr")
    .innerJoin("users as u", "u.id", "fr.receiver_id")
    .select(["fr.id", "u.id as user_id", "u.username", "u.avatar_url", "fr.created_at"])
    .where("fr.sender_id", "=", userId)
    .where("fr.status", "=", "pending")
    .orderBy("fr.created_at", "desc")
    .execute();

  return { incoming, outgoing };
}

export async function getFriendIds(userId: string): Promise<string[]> {
  const asSender = await db
    .selectFrom("friend_requests")
    .select("receiver_id as friend_id")
    .where("sender_id", "=", userId)
    .where("status", "=", "accepted")
    .execute();

  const asReceiver = await db
    .selectFrom("friend_requests")
    .select("sender_id as friend_id")
    .where("receiver_id", "=", userId)
    .where("status", "=", "accepted")
    .execute();

  return [...asSender, ...asReceiver].map((r) => r.friend_id);
}

export async function areFriends(userId1: string, userId2: string): Promise<boolean> {
  const row = await db
    .selectFrom("friend_requests")
    .select("id")
    .where((eb) =>
      eb.or([
        eb.and([eb("sender_id", "=", userId1), eb("receiver_id", "=", userId2)]),
        eb.and([eb("sender_id", "=", userId2), eb("receiver_id", "=", userId1)])
      ])
    )
    .where("status", "=", "accepted")
    .executeTakeFirst();

  return !!row;
}
