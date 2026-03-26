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

export const useWorkspaceStore = defineStore("workspace", () => {
  const nodes = ref<CanvasNode[]>([]);
  const selectedNodeIds = ref<Set<string>>(new Set());
  const activeNodeId = ref<string | null>(null);
  const isRunning = ref(false);

  const activeNode = computed(() => nodes.value.find((n) => n.id === activeNodeId.value) ?? null);

  const selectedNodes = computed(() => nodes.value.filter((n) => selectedNodeIds.value.has(n.id)));

  function setNodes(apiNodes: Omit<CanvasNode, "status" | "lastResponse" | "latency">[]) {
    nodes.value = apiNodes.map((n) => ({
      ...n,
      status: "idle",
      lastResponse: null,
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

  function reset() {
    nodes.value = [];
    selectedNodeIds.value = new Set();
    activeNodeId.value = null;
    isRunning.value = false;
  }

  return {
    nodes,
    selectedNodeIds,
    activeNodeId,
    activeNode,
    selectedNodes,
    isRunning,
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
    reset
  };
});
