import { getWorkspacesByCommunity } from "../../../../services/workspaceService";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const communityId = getRouterParam(event, "id");

  if (!communityId) {
    throw createError({ statusCode: 400, message: "Community ID is required" });
  }

  return getWorkspacesByCommunity(communityId, userId);
});
