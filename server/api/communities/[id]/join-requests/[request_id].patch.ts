import { db, generateId } from "../../../../db";

export default defineEventHandler(async (event) => {
  const reviewerId = requireAuth(event);
  const communityId = getRouterParam(event, "id");
  const requestId = getRouterParam(event, "request_id");

  if (!communityId || !requestId) {
    throw createError({ statusCode: 400, message: "Missing parameters" });
  }

  const { action } = await readBody<{ action: "approve" | "reject" }>(event);

  if (action !== "approve" && action !== "reject") {
    throw createError({ statusCode: 400, message: "action must be 'approve' or 'reject'" });
  }

  // Only the community owner can review requests
  const community = await db
    .selectFrom("communities")
    .select(["id", "owner_id", "name", "member_count"])
    .where("id", "=", communityId)
    .executeTakeFirst();

  if (!community) {
    throw createError({ statusCode: 404, message: "Community not found" });
  }

  if (community.owner_id !== reviewerId) {
    throw createError({ statusCode: 403, message: "Only the community owner can review requests" });
  }

  // Fetch the request
  const joinRequest = await db
    .selectFrom("community_join_requests")
    .select(["id", "user_id", "status"])
    .where("id", "=", requestId)
    .where("community_id", "=", communityId)
    .executeTakeFirst();

  if (!joinRequest) {
    throw createError({ statusCode: 404, message: "Join request not found" });
  }

  if (joinRequest.status !== "pending") {
    throw createError({ statusCode: 409, message: "This request has already been reviewed" });
  }

  const newStatus = action === "approve" ? "approved" : "rejected";

  // Update the request status
  await db
    .updateTable("community_join_requests")
    .set({
      status: newStatus,
      reviewed_by: reviewerId,
      reviewed_at: new Date()
    })
    .where("id", "=", requestId)
    .execute();

  if (action === "approve") {
    // Add user as member
    await db
      .insertInto("community_members")
      .values({
        id: generateId(),
        community_id: communityId,
        user_id: joinRequest.user_id,
        nickname: null
      })
      .onConflict((oc) => oc.constraint("uq_community_members").doNothing())
      .execute();

    // Increment member count
    await db
      .updateTable("communities")
      .set((eb) => ({ member_count: eb("member_count", "+", 1) }))
      .where("id", "=", communityId)
      .execute();
  }

  // Notify the requester of the decision
  await db
    .insertInto("notifications")
    .values({
      id: generateId(),
      user_id: joinRequest.user_id,
      actor_id: reviewerId,
      type: "community_join",
      entity_type: "community",
      entity_id: communityId,
      data: {
        approved: action === "approve",
        community_name: community.name
      }
    })
    .execute();

  return { success: true, status: newStatus };
});
