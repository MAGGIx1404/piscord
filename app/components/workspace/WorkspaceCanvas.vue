<template>
  <div class="h-full w-full">
    <VueFlow
      v-model:nodes="flowNodes"
      :node-types="nodeTypes"
      :default-viewport="{ x: 100, y: 100, zoom: 0.85 }"
      :min-zoom="0.2"
      :max-zoom="2"
      :snap-to-grid="true"
      :snap-grid="[20, 20]"
      :nodes-connectable="false"
      :select-nodes-on-drag="false"
      fit-view-on-init
      @node-click="onNodeClick"
      @node-double-click="onNodeDoubleClick"
      @node-drag-stop="onNodeDragStop"
      @pane-click="onPaneClick"
    >
      <Background :gap="20" :size="1" />
      <MiniMap />
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { VueFlow, type Node, type NodeMouseEvent } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { MiniMap } from "@vue-flow/minimap";
import AINodeComponent from "./AINodeComponent.vue";

const store = useWorkspaceStore();

const emit = defineEmits<{
  dragStop: [nodeId: string, x: number, y: number];
  openChat: [nodeId: string];
}>();

const nodeTypes: Record<string, any> = {
  aiNode: markRaw(AINodeComponent)
};

const flowNodes = computed<Node[]>({
  get: () =>
    store.nodes.map((n) => ({
      id: n.id,
      type: "aiNode",
      position: { x: n.position_x, y: n.position_y },
      data: { ...n },
      selected: store.selectedNodeIds.has(n.id)
    })),
  set: () => {
    // Selection managed by onNodeClick / store only
  }
});

function onNodeClick(event: NodeMouseEvent) {
  store.toggleNodeSelection(event.node.id);
}

function onNodeDoubleClick(event: NodeMouseEvent) {
  emit("openChat", event.node.id);
}

function onNodeDragStop(event: { node: Node }) {
  const { id, position } = event.node;
  store.updateNodePosition(id, position.x, position.y);
  emit("dragStop", id, position.x, position.y);
}

function onPaneClick() {
  store.clearSelection();
}
</script>

<style>
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";
@import "@vue-flow/minimap/dist/style.css";

.vue-flow {
  background: transparent;
}

.vue-flow__minimap {
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border) / 0.5);
  overflow: hidden;
}
</style>
