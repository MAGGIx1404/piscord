import { useDebounceFn } from "@vueuse/core";
import { puter } from "@heyputer/puter.js";
import type { NodeMessageItem } from "~~/server/services/nodeService";

function extractTextContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("");
  }
  return String(content ?? "");
}

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

  async function ensurePuterAuth() {
    if (!puter.auth?.isSignedIn()) {
      await puter.auth.signIn();
    }
  }

  async function callPuterAI(
    model: string,
    messages: Array<{ role: string; content: string }>,
    config?: { temperature?: number; max_tokens?: number; system_prompt?: string }
  ): Promise<{ content: string; latency_ms: number }> {
    await ensurePuterAuth();

    const chatMessages = config?.system_prompt
      ? [{ role: "system", content: config.system_prompt }, ...messages]
      : messages;

    const start = Date.now();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await puter.ai.chat(chatMessages, false as any, {
      model,
      ...(config?.temperature !== undefined && { temperature: config.temperature }),
      ...(config?.max_tokens !== undefined && { max_tokens: config.max_tokens })
    });
    const latency_ms = Date.now() - start;

    const content = extractTextContent(response?.message?.content);
    if (!content) throw new Error("Empty response from AI");

    return { content, latency_ms };
  }

  async function runPrompt(prompt: string, nodeIds: string[]) {
    if (!nodeIds.length) return;

    store.isRunning = true;
    nodeIds.forEach((id) => store.setNodeStatus(id, "running"));

    const executions = nodeIds.map(async (nodeId) => {
      const node = store.nodes.find((n) => n.id === nodeId);
      if (!node) return;

      try {
        // Get conversation history for context
        const history = await api<NodeMessageItem[]>(`${basePath}/nodes/${nodeId}/messages`);
        const messages = [
          ...history.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: prompt }
        ];

        const result = await callPuterAI(node.model, messages, node.config);

        // Save messages to server
        await api(`${basePath}/nodes/${nodeId}/messages`, {
          method: "POST",
          body: { prompt, response: result.content }
        });

        store.setNodeResponse(nodeId, result.content, result.latency_ms);
      } catch {
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
      const history = await api<NodeMessageItem[]>(`${basePath}/nodes/${nodeId}/messages`);
      const messages = [
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: prompt }
      ];

      const result = await callPuterAI(node.model, messages, node.config);

      await api(`${basePath}/nodes/${nodeId}/messages`, {
        method: "POST",
        body: { prompt, response: result.content }
      });

      store.setNodeResponse(nodeId, result.content, result.latency_ms);
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
