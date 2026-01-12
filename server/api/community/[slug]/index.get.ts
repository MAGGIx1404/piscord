import { getCommunityDetails, isCommunityMember } from "~~/server/service/community";

export default defineEventHandler(async (event) => {
  const session = event.context.session;
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const slug = getRouterParam(event, "slug");
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Community slug is required" });
  }

  const community = await getCommunityDetails(slug);

  if (!community) {
    throw createError({ statusCode: 404, statusMessage: "Community not found" });
  }

  if (community.type === "private") {
    const isMember = await isCommunityMember(community.id, session.user_id);
    if (!isMember) {
      throw createError({
        statusCode: 403,
        statusMessage: "You don't have access to this community"
      });
    }
  }

  return community;
});
