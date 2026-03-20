import { createWorkspace } from "../../../../services/workspaceService";
import type { CreateWorkspacePayload } from "../../../../services/workspaceService";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const communityId = getRouterParam(event, "id");

  if (!communityId) {
    throw createError({ statusCode: 400, message: "Community ID is required" });
  }

  const body = await readBody<CreateWorkspacePayload>(event);

  if (!body.name || body.name.trim().length < 1) {
    throw createError({ statusCode: 400, message: "Workspace name is required" });
  }

  if (body.name.trim().length > 100) {
    throw createError({
      statusCode: 400,
      message: "Workspace name must be 100 characters or less"
    });
  }

  return createWorkspace(communityId, userId, {
    name: body.name.trim(),
    emoji: body.emoji?.trim(),
    description: body.description?.trim(),
    banner_url: body.banner_url?.trim()
  });
});
