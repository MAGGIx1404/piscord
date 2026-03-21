import { getChannelsByCommunity } from "../../../../services/channelService";
import { resolveCommunityId } from "../../../../utils/community";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const slugOrId = getRouterParam(event, "id");

  if (!slugOrId) {
    throw createError({ statusCode: 400, message: "Community ID is required" });
  }

  const communityId = await resolveCommunityId(slugOrId);
  return getChannelsByCommunity(communityId, userId);
});
