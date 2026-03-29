import { useDebounceFn } from "@vueuse/core";
import type { NodeMessageItem } from "~~/server/services/nodeService";

export function useWorkspaceCanvas(communityId: string, workspaceId: string) {
  const api = useApi();
  const store = useWorkspaceStore();
  const basePath = `/api/communities/${communityId}/workspaces/${workspaceId}`;

  async function loadNodes() {
    const nodes = await api<any[]>(`${basePath}/nodes`);
    store.setNodes(nodes);
  }

  async function addNode(payload: {
    model: string;
    title: string;
    position_x: number;
    position_y: number;
    config?: Record<string, unknown>;
  }) {
    const node = await api<any>(`${basePath}/nodes`, {
      method: "POST",
      body: payload
    });
    store.addNode(node);
    return node;
  }

  async function updateNode(nodeId: string, payload: Record<string, unknown>) {
    const node = await api<any>(`${basePath}/nodes/${nodeId}`, {
      method: "PATCH",
      body: payload
    });
    const existing = store.nodes.find((n) => n.id === nodeId);
    if (existing) {
      Object.assign(existing, node);
    }
    return node;
  }

  async function removeNode(nodeId: string) {
    await api(`${basePath}/nodes/${nodeId}`, { method: "DELETE" });
    store.removeNode(nodeId);
  }

  const syncPosition = useDebounceFn(async (nodeId: string, x: number, y: number) => {
    await api(`${basePath}/nodes/${nodeId}`, {
      method: "PATCH",
      body: { position_x: x, position_y: y }
    });
  }, 500);

  async function runPrompt(prompt: string, nodeIds: string[]) {
    if (!nodeIds.length || !store.aiEnabled) return;

    store.isRunning = true;
    nodeIds.forEach((id) => store.setNodeStatus(id, "running"));

    const executions = nodeIds.map(async (nodeId, index) => {
      const node = store.nodes.find((n) => n.id === nodeId);
      if (!node) return;

      if (index > 0) await new Promise((r) => setTimeout(r, index * 300));

      try {
        const result = await api<{ response: string; latency_ms: number }>(
          `${basePath}/nodes/${nodeId}/run`,
          { method: "POST", body: { prompt } }
        );
        store.setNodeResponse(nodeId, result.response, result.latency_ms);
      } catch (err) {
        console.error(`[AI] Failed for model "${node.model}" (node ${nodeId}):`, err);
        store.setNodeError(nodeId);
      }
    });

    await Promise.allSettled(executions);
    store.isRunning = false;
  }

  async function runSingleNode(nodeId: string, prompt: string) {
    const node = store.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    store.setNodeStatus(nodeId, "running");

    try {
      const result = await api<{ response: string; latency_ms: number }>(
        `${basePath}/nodes/${nodeId}/run`,
        { method: "POST", body: { prompt } }
      );
      store.setNodeResponse(nodeId, result.response, result.latency_ms);
    } catch {
      store.setNodeError(nodeId);
    }
  }

  async function loadNodeMessages(nodeId: string): Promise<NodeMessageItem[]> {
    return api<NodeMessageItem[]>(`${basePath}/nodes/${nodeId}/messages`);
  }

  return {
    loadNodes,
    addNode,
    updateNode,
    removeNode,
    syncPosition,
    runPrompt,
    runSingleNode,
    loadNodeMessages
  };
}
