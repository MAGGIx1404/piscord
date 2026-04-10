import { runMultiNode } from "../../../../../services/nodeService";
import { resolveCommunityId } from "../../../../../utils/community";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const slugOrId = getRouterParam(event, "id");
  const workspaceId = getRouterParam(event, "workspaceId");

  if (!slugOrId) throw createError({ statusCode: 400, message: "Community ID is required" });
  if (!workspaceId) throw createError({ statusCode: 400, message: "Workspace ID is required" });

  const body = await readBody<{ prompt?: string; node_ids?: string[] }>(event);

  if (!body?.prompt?.trim()) {
    throw createError({ statusCode: 400, message: "Prompt is required" });
  }
  if (!body?.node_ids?.length) {
    throw createError({ statusCode: 400, message: "At least one node ID is required" });
  }

  const communityId = await resolveCommunityId(slugOrId);
  return runMultiNode(workspaceId, userId, body.prompt.trim(), body.node_ids);
});
