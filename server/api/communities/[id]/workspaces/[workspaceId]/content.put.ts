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

  const body = await readBody<{ content: unknown }>(event);
  if (!body?.content) {
    throw createError({ statusCode: 400, message: "Content is required" });
  }

  const contentBuffer = Buffer.from(JSON.stringify(body.content), "utf-8");

  await db
    .updateTable("workspaces")
    .set({ content: contentBuffer })
    .where("id", "=", workspaceId)
    .execute();

  return { success: true, updated_at: new Date() };
});
