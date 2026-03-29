import { defineStore } from "pinia";
import type { AiNodeConfig } from "~~/server/db/tables";

export interface CanvasNode {
  id: string;
  workspace_id: string;
  model: string;
  title: string;
  position_x: number;
  position_y: number;
  config: AiNodeConfig;
  created_at: string;
  updated_at: string;
  // Runtime state (not persisted)
  status: "idle" | "running" | "completed" | "error";
  lastResponse: string | null;
  latency: number | null;
}

export interface MemoryItem {
  id: string;
  workspace_id: string;
  content: string;
  type: string;
  created_by: string | null;
  created_at: string;
}

export const useWorkspaceStore = defineStore("workspace", () => {
  const nodes = ref<CanvasNode[]>([]);
  const selectedNodeIds = ref<Set<string>>(new Set());
  const activeNodeId = ref<string | null>(null);
  const isRunning = ref(false);
  const aiEnabled = ref(false);
  const memories = ref<MemoryItem[]>([]);

  const activeNode = computed(() => nodes.value.find((n) => n.id === activeNodeId.value) ?? null);

  const selectedNodes = computed(() => nodes.value.filter((n) => selectedNodeIds.value.has(n.id)));

  function setNodes(apiNodes: Omit<CanvasNode, "status" | "lastResponse" | "latency">[] | (Omit<CanvasNode, "status" | "lastResponse" | "latency"> & { last_response?: string | null })[]) {
    nodes.value = apiNodes.map((n) => ({
      ...n,
      status: "idle",
      lastResponse: ("last_response" in n && n.last_response) ? n.last_response : null,
      latency: null
    }));
  }

  function addNode(node: Omit<CanvasNode, "status" | "lastResponse" | "latency">) {
    nodes.value.push({ ...node, status: "idle", lastResponse: null, latency: null });
  }

  function removeNode(id: string) {
    nodes.value = nodes.value.filter((n) => n.id !== id);
    selectedNodeIds.value.delete(id);
    if (activeNodeId.value === id) activeNodeId.value = null;
  }

  function updateNodePosition(id: string, x: number, y: number) {
    const node = nodes.value.find((n) => n.id === id);
    if (node) {
      node.position_x = x;
      node.position_y = y;
    }
  }

  function toggleNodeSelection(id: string) {
    if (selectedNodeIds.value.has(id)) {
      selectedNodeIds.value.delete(id);
    } else {
      selectedNodeIds.value.add(id);
    }
    selectedNodeIds.value = new Set(selectedNodeIds.value);
  }

  function selectAllNodes() {
    selectedNodeIds.value = new Set(nodes.value.map((n) => n.id));
  }

  function clearSelection() {
    selectedNodeIds.value = new Set();
  }

  function setNodeStatus(id: string, status: CanvasNode["status"]) {
    const node = nodes.value.find((n) => n.id === id);
    if (node) node.status = status;
  }

  function setNodeResponse(id: string, response: string, latency: number) {
    const node = nodes.value.find((n) => n.id === id);
    if (node) {
      node.lastResponse = response;
      node.latency = latency;
      node.status = "completed";
    }
  }

  function setNodeError(id: string) {
    const node = nodes.value.find((n) => n.id === id);
    if (node) node.status = "error";
  }

  function toggleAI() {
    aiEnabled.value = !aiEnabled.value;
  }

  function setMemories(items: MemoryItem[]) {
    memories.value = items;
  }

  function addMemoryItem(item: MemoryItem) {
    memories.value.unshift(item);
  }

  function removeMemoryItem(id: string) {
    memories.value = memories.value.filter((m) => m.id !== id);
  }

  function reset() {
    nodes.value = [];
    selectedNodeIds.value = new Set();
    activeNodeId.value = null;
    isRunning.value = false;
    aiEnabled.value = false;
    memories.value = [];
  }

  return {
    nodes,
    selectedNodeIds,
    activeNodeId,
    activeNode,
    selectedNodes,
    isRunning,
    aiEnabled,
    memories,
    setNodes,
    addNode,
    removeNode,
    updateNodePosition,
    toggleNodeSelection,
    selectAllNodes,
    clearSelection,
    setNodeStatus,
    setNodeResponse,
    setNodeError,
    toggleAI,
    setMemories,
    addMemoryItem,
    removeMemoryItem,
    reset
  };
});
