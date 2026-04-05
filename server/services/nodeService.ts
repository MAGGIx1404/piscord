import { db, generateId } from "../db";
import type { AiNodeConfig } from "../db/tables";
import { requireWorkspaceMembership } from "./workspaceService";
import { runAI } from "./aiService";
import { buildMemoryContext } from "./memoryService";


export interface CreateNodePayload {
  model: string;
  title: string;
  position_x?: number;
  position_y?: number;
  config?: AiNodeConfig;
}

export interface UpdateNodePayload {
  title?: string;
  model?: string;
  position_x?: number;
  position_y?: number;
  config?: AiNodeConfig;
}

export interface NodeItem {
  id: string;
  workspace_id: string;
  model: string;
  title: string;
  position_x: number;
  position_y: number;
  config: AiNodeConfig;
  created_at: Date;
  updated_at: Date;
}

export interface NodeMessageItem {
  id: string;
  node_id: string;
  role: string;
  content: string;
  created_at: Date;
}

export interface PromptRunResultItem {
  id: string;
  node_id: string;
  response: string | null;
  status: string;
  latency_ms: number | null;
  error: string | null;
}


const NODE_COLUMNS = [
  "id",
  "workspace_id",
  "model",
  "title",
  "position_x",
  "position_y",
  "config",
  "created_at",
  "updated_at"
] as const;

export async function getNodesByWorkspace(
  workspaceId: string,
  communityId: string,
  userId: string
): Promise<(NodeItem & { last_response: string | null })[]> {
  await requireWorkspaceMembership(workspaceId, userId);

  const rows = await db
    .selectFrom("ai_nodes")
    .select([...NODE_COLUMNS])
    .where("workspace_id", "=", workspaceId)
    .orderBy("created_at", "asc")
    .execute();

  // Fetch last assistant message for each node
  const nodeIds = rows.map((r) => r.id);
  let lastMessages: Array<{ node_id: string; content: string }> = [];
  if (nodeIds.length > 0) {
    // Get the most recent assistant message per node using DISTINCT ON
    lastMessages = await db
      .selectFrom("node_messages")
      .select(["node_id", "content"])
      .where("node_id", "in", nodeIds)
      .where("role", "=", "assistant")
      .orderBy("node_id")
      .orderBy("created_at", "desc")
      .execute()
      .then((msgs) => {
        // Keep only the first (most recent) per node_id
        const seen = new Set<string>();
        return msgs.filter((m) => {
          if (seen.has(m.node_id)) return false;
          seen.add(m.node_id);
          return true;
        });
      });
  }

  const lastMap = new Map(lastMessages.map((m) => [m.node_id, m.content]));

  return (rows as NodeItem[]).map((r) => ({
    ...r,
    last_response: lastMap.get(r.id) ?? null
  }));
}

export async function createNode(
  workspaceId: string,
  communityId: string,
  userId: string,
  payload: CreateNodePayload
): Promise<NodeItem> {
  await requireWorkspaceMembership(workspaceId, userId);

  const id = generateId();
  await db
    .insertInto("ai_nodes")
    .values({
      id,
      workspace_id: workspaceId,
      model: payload.model,
      title: payload.title,
      position_x: payload.position_x ?? 0,
      position_y: payload.position_y ?? 0,
      config: payload.config ?? {}
    })
    .execute();

  const node = await db
    .selectFrom("ai_nodes")
    .select([...NODE_COLUMNS])
    .where("id", "=", id)
    .executeTakeFirstOrThrow();

  return node as NodeItem;
}

export async function updateNode(
  nodeId: string,
  workspaceId: string,
  communityId: string,
  userId: string,
  payload: UpdateNodePayload
): Promise<NodeItem> {
  await requireWorkspaceMembership(workspaceId, userId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {};
  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.model !== undefined) updates.model = payload.model;
  if (payload.position_x !== undefined) updates.position_x = payload.position_x;
  if (payload.position_y !== undefined) updates.position_y = payload.position_y;
  if (payload.config !== undefined) updates.config = JSON.stringify(payload.config);

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, message: "No fields to update" });
  }

  await db
    .updateTable("ai_nodes")
    .set(updates)
    .where("id", "=", nodeId)
    .where("workspace_id", "=", workspaceId)
    .execute();

  const node = await db
    .selectFrom("ai_nodes")
    .select([...NODE_COLUMNS])
    .where("id", "=", nodeId)
    .executeTakeFirst();

  if (!node) {
    throw createError({ statusCode: 404, message: "Node not found" });
  }

  return node as NodeItem;
}

export async function deleteNode(
  nodeId: string,
  workspaceId: string,
  communityId: string,
  userId: string
): Promise<void> {
  await requireWorkspaceMembership(workspaceId, userId);

  const result = await db
    .deleteFrom("ai_nodes")
    .where("id", "=", nodeId)
    .where("workspace_id", "=", workspaceId)
    .executeTakeFirst();

  if (result.numDeletedRows === BigInt(0)) {
    throw createError({ statusCode: 404, message: "Node not found" });
  }
}


export async function getNodeMessages(
  nodeId: string,
  workspaceId: string,
  userId: string
): Promise<NodeMessageItem[]> {
  await requireWorkspaceMembership(workspaceId, userId);

  const rows = await db
    .selectFrom("node_messages")
    .select(["id", "node_id", "role", "content", "created_at"])
    .where("node_id", "=", nodeId)
    .orderBy("created_at", "asc")
    .execute();

  return rows;
}


export async function saveNodeMessages(
  nodeId: string,
  workspaceId: string,
  userId: string,
  prompt: string,
  response: string
): Promise<{ success: boolean }> {
  await requireWorkspaceMembership(workspaceId, userId);

  const node = await db
    .selectFrom("ai_nodes")
    .select(["id"])
    .where("id", "=", nodeId)
    .where("workspace_id", "=", workspaceId)
    .executeTakeFirst();

  if (!node) throw createError({ statusCode: 404, message: "Node not found" });

  await db
    .insertInto("node_messages")
    .values([
      { id: generateId(), node_id: nodeId, role: "user", content: prompt },
      { id: generateId(), node_id: nodeId, role: "assistant", content: response }
    ])
    .execute();

  return { success: true };
}


export async function runSingleNode(
  nodeId: string,
  workspaceId: string,
  userId: string,
  prompt: string
): Promise<{ response: string; latency_ms: number }> {
  await requireWorkspaceMembership(workspaceId, userId);

  const node = await db
    .selectFrom("ai_nodes")
    .select(["id", "model", "config"])
    .where("id", "=", nodeId)
    .where("workspace_id", "=", workspaceId)
    .executeTakeFirst();

  if (!node) throw createError({ statusCode: 404, message: "Node not found" });

  // Get existing conversation history
  const history = await db
    .selectFrom("node_messages")
    .select(["role", "content"])
    .where("node_id", "=", nodeId)
    .orderBy("created_at", "asc")
    .execute();

  const messages = [...history, { role: "user", content: prompt }];
  const config = node.config as AiNodeConfig;

  // Inject workspace memory context for smarter responses
  const memoryContext = await buildMemoryContext(workspaceId);

  const result = await runAI({
    model: node.model,
    messages,
    config,
    memoryContext
  });

  // Persist messages
  const userMsgId = generateId();
  const assistantMsgId = generateId();

  await db
    .insertInto("node_messages")
    .values([
      { id: userMsgId, node_id: nodeId, role: "user", content: prompt },
      { id: assistantMsgId, node_id: nodeId, role: "assistant", content: result.content }
    ])
    .execute();

  return { response: result.content, latency_ms: result.latency_ms };
}


export async function runMultiNode(
  workspaceId: string,
  userId: string,
  prompt: string,
  nodeIds: string[]
): Promise<{ prompt_run_id: string; results: PromptRunResultItem[] }> {
  await requireWorkspaceMembership(workspaceId, userId);

  // Verify all nodes belong to this workspace
  const nodes = await db
    .selectFrom("ai_nodes")
    .select(["id", "model", "config"])
    .where("workspace_id", "=", workspaceId)
    .where("id", "in", nodeIds)
    .execute();

  if (nodes.length !== nodeIds.length) {
    throw createError({ statusCode: 400, message: "Some nodes do not belong to this workspace" });
  }

  // Create prompt run
  const runId = generateId();
  await db
    .insertInto("prompt_runs")
    .values({
      id: runId,
      workspace_id: workspaceId,
      prompt,
      status: "running",
      created_by: userId
    })
    .execute();

  // Create pending result rows
  const resultRows = nodes.map((node) => ({
    id: generateId(),
    prompt_run_id: runId,
    node_id: node.id,
    status: "pending" as const
  }));

  await db.insertInto("prompt_run_results").values(resultRows).execute();

  // Build memory context once for all nodes
  const memoryContext = await buildMemoryContext(workspaceId);

  // Execute all nodes in parallel
  const executions = nodes.map(async (node) => {
    const resultRow = resultRows.find((r) => r.node_id === node.id)!;
    const config = node.config as AiNodeConfig;

    // Get history for this node
    const history = await db
      .selectFrom("node_messages")
      .select(["role", "content"])
      .where("node_id", "=", node.id)
      .orderBy("created_at", "asc")
      .execute();

    const messages = [...history, { role: "user", content: prompt }];

    try {
      const aiResult = await runAI({ model: node.model, messages, config, memoryContext });

      // Update result row
      await db
        .updateTable("prompt_run_results")
        .set({
          response: aiResult.content,
          status: "completed",
          latency_ms: aiResult.latency_ms
        })
        .where("id", "=", resultRow.id)
        .execute();

      // Persist messages
      await db
        .insertInto("node_messages")
        .values([
          { id: generateId(), node_id: node.id, role: "user", content: prompt },
          { id: generateId(), node_id: node.id, role: "assistant", content: aiResult.content }
        ])
        .execute();

      return {
        id: resultRow.id,
        node_id: node.id,
        response: aiResult.content,
        status: "completed" as const,
        latency_ms: aiResult.latency_ms,
        error: null
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error";

      await db
        .updateTable("prompt_run_results")
        .set({ status: "failed", error })
        .where("id", "=", resultRow.id)
        .execute();

      return {
        id: resultRow.id,
        node_id: node.id,
        response: null,
        status: "failed" as const,
        latency_ms: null,
        error
      };
    }
  });

  const results = await Promise.allSettled(executions);
  const finalResults: PromptRunResultItem[] = results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : {
          id: "",
          node_id: "",
          response: null,
          status: "failed",
          latency_ms: null,
          error: r.reason?.message ?? "Unknown error"
        }
  );

  // Update prompt run status
  const allCompleted = finalResults.every((r) => r.status === "completed");
  const allFailed = finalResults.every((r) => r.status === "failed");
  await db
    .updateTable("prompt_runs")
    .set({ status: allFailed ? "failed" : allCompleted ? "completed" : "completed" })
    .where("id", "=", runId)
    .execute();

  return { prompt_run_id: runId, results: finalResults };
}
