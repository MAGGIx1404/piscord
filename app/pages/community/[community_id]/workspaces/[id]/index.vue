<template>
  <div class="relative h-screen w-screen bg-background">
    <WorkspaceToolbar
      :workspace-name="workspace?.name ?? ''"
      :models="models"
      :members="members"
      @add-node="handleAddNode"
      @select-all="store.selectAllNodes()"
      @open-history="historyOpen = true"
    />

    <ClientOnly>
      <WorkspaceCanvas @drag-stop="handleDragStop" @open-chat="openChatForNode" />
      <template #fallback>
        <div class="flex h-full items-center justify-center">
          <Loader2 class="size-6 animate-spin text-muted-foreground" />
        </div>
      </template>
    </ClientOnly>

    <WorkspaceEmptyState :show="!store.nodes.length && !loading" />

    <WorkspacePromptBar
      :selected-count="selectedCount"
      :is-running="store.isRunning"
      @submit="handlePromptSubmit"
    />

    <!-- Node config side panel -->
    <WorkspaceNodePanel
      v-model:open="panelOpen"
      :node="activeNode"
      :messages="nodeMessages"
      :messages-loading="messagesLoading"
      @update="handleNodeUpdate"
      @run="handleSingleRun"
      @delete="handleDeleteNode"
    />

    <!-- Node chat dialog -->
    <WorkspaceNodeChatDialog
      v-model:open="chatOpen"
      :node="chatNode"
      :messages="chatMessages"
      :loading="chatMessagesLoading"
      @send="handleChatSend"
    />

    <!-- History panel -->
    <WorkspaceHistoryPanel
      v-model:open="historyOpen"
      :grouped-history="groupedHistory"
      :loading="historyLoading"
      @open-node="openChatForNode"
    />

    <AppDock />
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";
import type { NodeMessageItem } from "~~/server/services/nodeService";

definePageMeta({ layout: false });

const route = useRoute();
const communityId = route.params.community_id as string;
const workspaceId = route.params.id as string;
const api = useApi();
const basePath = `/api/communities/${communityId}/workspaces/${workspaceId}`;

const store = useWorkspaceStore();
const canvas = useWorkspaceCanvas(communityId, workspaceId);
const { panelOpen, activeNode, nodeMessages, messagesLoading, reloadMessages } = useNodePanel(
  canvas.loadNodeMessages
);
const { models, load: loadModels } = usePuterModels();

const loading = ref(true);
const selectedCount = computed(() => store.selectedNodeIds.size);

// Members
const members = ref<Array<{ id: string; username: string; avatar_url: string | null }>>([]);

// Chat dialog state
const chatOpen = ref(false);
const chatNodeId = ref<string | null>(null);
const chatMessages = ref<NodeMessageItem[]>([]);
const chatMessagesLoading = ref(false);

const chatNode = computed(() =>
  chatNodeId.value ? store.nodes.find((n) => n.id === chatNodeId.value) ?? null : null
);

// History panel state
const historyOpen = ref(false);
const historyMessages = ref<any[]>([]);
const historyLoading = ref(false);

const groupedHistory = computed(() => {
  const groups = new Map<string, { nodeId: string; title: string; model: string; status: string; messages: any[] }>();
  for (const msg of historyMessages.value) {
    if (!groups.has(msg.node_id)) {
      const node = store.nodes.find((n) => n.id === msg.node_id);
      groups.set(msg.node_id, {
        nodeId: msg.node_id,
        title: msg.node_title ?? node?.title ?? "Unknown",
        model: msg.node_model ?? node?.model ?? "",
        status: node?.status ?? "idle",
        messages: []
      });
    }
    groups.get(msg.node_id)!.messages.push(msg);
  }
  return Array.from(groups.values());
});

// Provide delete handler for deeply nested node components
provide("deleteNode", (nodeId: string) => canvas.removeNode(nodeId));

const { data: workspace } = await useFetch(
  `/api/communities/${communityId}/workspaces/${workspaceId}`
);

onMounted(async () => {
  try {
    await Promise.all([
      canvas.loadNodes(),
      loadModels(),
      loadMembers()
    ]);
  } finally {
    loading.value = false;
  }
});

async function loadMembers() {
  try {
    members.value = await api<any[]>(`${basePath}/members`);
  } catch {
    members.value = [];
  }
}

async function openChatForNode(nodeId: string) {
  chatNodeId.value = nodeId;
  chatOpen.value = true;
  chatMessagesLoading.value = true;
  try {
    chatMessages.value = await canvas.loadNodeMessages(nodeId);
  } catch {
    chatMessages.value = [];
  } finally {
    chatMessagesLoading.value = false;
  }
}

async function handleChatSend(nodeId: string, prompt: string) {
  await canvas.runSingleNode(nodeId, prompt);
  // Reload chat messages
  chatMessages.value = await canvas.loadNodeMessages(nodeId);
  // Also reload side panel if same node
  if (store.activeNodeId === nodeId) {
    await reloadMessages(nodeId);
  }
}

// Load history when panel opens
watch(historyOpen, async (open) => {
  if (!open) return;
  historyLoading.value = true;
  try {
    historyMessages.value = await api<any[]>(`${basePath}/history`);
  } catch {
    historyMessages.value = [];
  } finally {
    historyLoading.value = false;
  }
});

async function handleAddNode(model: { id: string; name: string; provider: string }) {
  await canvas.addNode({
    model: model.id,
    title: model.name,
    position_x: 100 + Math.random() * 400,
    position_y: 100 + Math.random() * 300
  });
}

function handleDragStop(nodeId: string, x: number, y: number) {
  canvas.syncPosition(nodeId, x, y);
}

async function handlePromptSubmit(prompt: string) {
  await canvas.runPrompt(prompt, [...store.selectedNodeIds]);
}

function handleNodeUpdate(nodeId: string, payload: Record<string, unknown>) {
  canvas.updateNode(nodeId, payload);
}

async function handleSingleRun(nodeId: string, prompt: string) {
  await canvas.runSingleNode(nodeId, prompt);
  if (store.activeNodeId === nodeId) {
    await reloadMessages(nodeId);
  }
}

async function handleDeleteNode(nodeId: string) {
  panelOpen.value = false;
  chatOpen.value = false;
  await canvas.removeNode(nodeId);
}

onUnmounted(() => {
  store.reset();
});
</script>
