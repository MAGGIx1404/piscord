import { db, generateId } from "../db";
import { requireWorkspaceMembership } from "./workspaceService";

export interface MemoryItem {
  id: string;
  workspace_id: string;
  content: string;
  type: string;
  created_by: string | null;
  created_at: Date;
}

async function tableExists(): Promise<boolean> {
  try {
    await db.selectFrom("workspace_memories").select("id").limit(1).execute();
    return true;
  } catch {
    return false;
  }
}

export async function getMemories(workspaceId: string, userId: string): Promise<MemoryItem[]> {
  await requireWorkspaceMembership(workspaceId, userId);

  if (!(await tableExists())) return [];

  return db
    .selectFrom("workspace_memories")
    .select(["id", "workspace_id", "content", "type", "created_by", "created_at"])
    .where("workspace_id", "=", workspaceId)
    .orderBy("created_at", "desc")
    .limit(50)
    .execute();
}

export async function addMemory(
  workspaceId: string,
  userId: string,
  content: string,
  type: string = "note"
): Promise<MemoryItem> {
  await requireWorkspaceMembership(workspaceId, userId);

  if (!(await tableExists())) {
    throw createError({
      statusCode: 503,
      message: "Memory feature not available — run migrations first"
    });
  }

  const id = generateId();
  await db
    .insertInto("workspace_memories")
    .values({ id, workspace_id: workspaceId, content, type, created_by: userId })
    .execute();

  const row = await db
    .selectFrom("workspace_memories")
    .select(["id", "workspace_id", "content", "type", "created_by", "created_at"])
    .where("id", "=", id)
    .executeTakeFirstOrThrow();

  return row;
}

export async function deleteMemory(
  memoryId: string,
  workspaceId: string,
  userId: string
): Promise<void> {
  await requireWorkspaceMembership(workspaceId, userId);

  if (!(await tableExists())) return;

  const result = await db
    .deleteFrom("workspace_memories")
    .where("id", "=", memoryId)
    .where("workspace_id", "=", workspaceId)
    .executeTakeFirst();

  if (result.numDeletedRows === BigInt(0)) {
    throw createError({ statusCode: 404, message: "Memory not found" });
  }
}

export async function buildMemoryContext(workspaceId: string): Promise<string> {
  if (!(await tableExists())) return "";

  const memories = await db
    .selectFrom("workspace_memories")
    .select(["content", "type"])
    .where("workspace_id", "=", workspaceId)
    .orderBy("created_at", "desc")
    .limit(10)
    .execute();

  if (memories.length === 0) return "";

  return memories.map((m) => `[${m.type}] ${m.content}`).join("\n");
}
