import { joinCommunity } from "../../../services/communityService";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const communityId = getRouterParam(event, "id");

  if (!communityId) {
    throw createError({ statusCode: 400, message: "Community ID is required" });
  }

  const result = await joinCommunity(userId, communityId);

  return result;
});
