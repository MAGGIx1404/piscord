import { getWorkspaceById } from "../../../../../services/workspaceService";
import { resolveCommunityId } from "../../../../../utils/community";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const slugOrId = getRouterParam(event, "id");
  const workspaceId = getRouterParam(event, "workspaceId");

  if (!slugOrId) throw createError({ statusCode: 400, message: "Community ID is required" });
  if (!workspaceId) throw createError({ statusCode: 400, message: "Workspace ID is required" });

  const communityId = await resolveCommunityId(slugOrId);
  return getWorkspaceById(workspaceId, communityId, userId);
});
