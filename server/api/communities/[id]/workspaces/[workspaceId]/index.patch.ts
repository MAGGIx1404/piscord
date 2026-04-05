import { db } from "../../../../../db";
import { resolveCommunityId } from "../../../../../utils/community";
import { requireWorkspaceMembership } from "../../../../../services/workspaceService";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const slugOrId = getRouterParam(event, "id");
  const workspaceId = getRouterParam(event, "workspaceId");

  if (!slugOrId) throw createError({ statusCode: 400, message: "Community ID is required" });
  if (!workspaceId) throw createError({ statusCode: 400, message: "Workspace ID is required" });

  await resolveCommunityId(slugOrId);
  await requireWorkspaceMembership(workspaceId, userId);

  const body = await readBody<{ name?: string; description?: string; emoji?: string }>(event);

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.emoji !== undefined) updates.emoji = body.emoji;

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, message: "No fields to update" });
  }

  await db.updateTable("workspaces").set(updates).where("id", "=", workspaceId).execute();

  return { success: true };
});
