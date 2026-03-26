import type { NodeMessageItem } from "~~/server/services/nodeService";

export function useNodePanel(loadNodeMessages: (nodeId: string) => Promise<NodeMessageItem[]>) {
  const store = useWorkspaceStore();
  const panelOpen = ref(false);
  const nodeMessages = ref<NodeMessageItem[]>([]);
  const messagesLoading = ref(false);

  const activeNode = computed(() => {
    if (!store.activeNodeId) return null;
    return store.nodes.find((n) => n.id === store.activeNodeId) ?? null;
  });

  watch(
    () => store.activeNodeId,
    async (nodeId) => {
      if (!nodeId) {
        nodeMessages.value = [];
        return;
      }
      panelOpen.value = true;
      messagesLoading.value = true;
      try {
        nodeMessages.value = await loadNodeMessages(nodeId);
      } catch {
        nodeMessages.value = [];
      } finally {
        messagesLoading.value = false;
      }
    }
  );

  watch(panelOpen, (open) => {
    if (!open) store.activeNodeId = null;
  });

  async function reloadMessages(nodeId: string) {
    nodeMessages.value = await loadNodeMessages(nodeId);
  }

  return { panelOpen, nodeMessages, messagesLoading, activeNode, reloadMessages };
}
