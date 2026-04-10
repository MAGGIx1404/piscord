import { createNode } from "../../../../../../services/nodeService";
import { resolveCommunityId } from "../../../../../../utils/community";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const slugOrId = getRouterParam(event, "id");
  const workspaceId = getRouterParam(event, "workspaceId");

  if (!slugOrId) throw createError({ statusCode: 400, message: "Community ID is required" });
  if (!workspaceId) throw createError({ statusCode: 400, message: "Workspace ID is required" });

  const body = await readBody<{
    model?: string;
    title?: string;
    position_x?: number;
    position_y?: number;
    config?: Record<string, unknown>;
  }>(event);

  if (!body?.model) throw createError({ statusCode: 400, message: "Model is required" });
  if (!body?.title) throw createError({ statusCode: 400, message: "Title is required" });

  const communityId = await resolveCommunityId(slugOrId);
  return createNode(workspaceId, communityId, userId, {
    model: body.model,
    title: body.title,
    position_x: body.position_x,
    position_y: body.position_y,
    config: body.config as any
  });
});
