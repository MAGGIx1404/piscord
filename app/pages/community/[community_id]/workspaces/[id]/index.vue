<template>
  <div class="relative h-screen w-screen bg-background">
    <WorkspaceToolbar
      :workspace-name="workspace?.name ?? ''"
      :personas="personas"
      :members="members"
      :ai-enabled="store.aiEnabled"
      :memory-count="store.memories.length"
      @add-node="handleAddNode"
      @select-all="store.selectAllNodes()"
      @open-history="historyOpen = true"
      @open-memory="memoryOpen = true"
      @toggle-ai="store.toggleAI()"
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
      :ai-enabled="store.aiEnabled"
      :suggestions="suggestions"
      :templates="templates"
      @submit="handlePromptSubmit"
      @input-change="onPromptInput"
    />

    <WorkspaceNodePanel
      v-model:open="panelOpen"
      :node="activeNode"
      :messages="nodeMessages"
      :messages-loading="messagesLoading"
      @update="handleNodeUpdate"
      @run="handleSingleRun"
      @delete="handleDeleteNode"
    />

    <WorkspaceNodeChatDialog
      v-model:open="chatOpen"
      :node="chatNode"
      :messages="chatMessages"
      :loading="chatMessagesLoading"
      @send="handleChatSend"
      @save-to-memory="handleSaveToMemory"
    />

    <WorkspaceHistoryPanel
      v-model:open="historyOpen"
      :grouped-history="groupedHistory"
      :loading="historyLoading"
      @open-node="openChatForNode"
    />

    <WorkspaceMemoryPanel
      v-model:open="memoryOpen"
      :memories="store.memories"
      @add="handleAddMemory"
      @delete="handleDeleteMemory"
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
const memory = useWorkspaceMemory(communityId, workspaceId);
const { suggestions, updateText: onPromptInput } = useSuggestions();

const loading = ref(true);
const selectedCount = computed(() => store.selectedNodeIds.size);
const personas = ref<Array<{ id: string; name: string; emoji: string; description: string }>>([]);
const templates = ref<Array<{ id: string; name: string; emoji: string; template: string }>>([]);
const members = ref<Array<{ id: string; username: string; avatar_url: string | null }>>([]);

const chatOpen = ref(false);
const chatNodeId = ref<string | null>(null);
const chatMessages = ref<NodeMessageItem[]>([]);
const chatMessagesLoading = ref(false);

const chatNode = computed(() =>
  chatNodeId.value ? store.nodes.find((n) => n.id === chatNodeId.value) ?? null : null
);

const historyOpen = ref(false);
const historyMessages = ref<any[]>([]);
const historyLoading = ref(false);
const memoryOpen = ref(false);

const groupedHistory = computed(() => {
  const groups = new Map<
    string,
    { nodeId: string; title: string; model: string; status: string; messages: any[] }
  >();
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

provide("deleteNode", (nodeId: string) => canvas.removeNode(nodeId));

const { data: workspace } = await useFetch(
  `/api/communities/${communityId}/workspaces/${workspaceId}`
);

onMounted(async () => {
  try {
    await Promise.all([
      canvas.loadNodes(),
      loadPersonas(),
      loadTemplates(),
      loadMembers(),
      memory.loadMemories()
    ]);
  } finally {
    loading.value = false;
  }
});

async function loadPersonas() {
  try {
    const data = await api<{ personas: typeof personas.value }>("/api/ai/personas");
    personas.value = data.personas;
  } catch {
    personas.value = [];
  }
}

async function loadTemplates() {
  try {
    const data = await api<{ templates: typeof templates.value }>("/api/ai/templates");
    templates.value = data.templates;
  } catch {
    templates.value = [];
  }
}

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
  chatMessages.value = await canvas.loadNodeMessages(nodeId);
  if (store.activeNodeId === nodeId) {
    await reloadMessages(nodeId);
  }
}

async function handleSaveToMemory(content: string) {
  await memory.addMemory(content.slice(0, 500), "output");
}

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

async function handleAddNode(persona: { id: string; name: string; emoji: string }) {
  await canvas.addNode({
    model: persona.id,
    title: `${persona.emoji} ${persona.name}`,
    position_x: 100 + Math.random() * 400,
    position_y: 100 + Math.random() * 300
  });
}

function handleDragStop(nodeId: string, x: number, y: number) {
  canvas.syncPosition(nodeId, x, y);
}

async function handlePromptSubmit(prompt: string) {
  const nodeIds = [...store.selectedNodeIds];
  await canvas.runPrompt(prompt, nodeIds);
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

async function handleAddMemory(content: string, type: string) {
  await memory.addMemory(content, type);
}

async function handleDeleteMemory(id: string) {
  await memory.removeMemory(id);
}

onUnmounted(() => {
  store.reset();
});
</script>
