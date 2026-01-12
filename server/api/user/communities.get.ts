import { findUserCommunities } from "~~/server/service/community";

export default defineEventHandler(async (event) => {
  const session = event.context.session;
  if (!session) {
    return sendError(event, createError({ statusCode: 401, statusMessage: "Unauthorized" }));
  }

  const communities = await findUserCommunities(session.user_id);

  return {
    communities,
    total: communities.length
  };
});
