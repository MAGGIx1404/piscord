<template>
  <div
    class="group w-72 cursor-pointer rounded-xl border bg-card shadow-md transition-all hover:shadow-lg"
    :class="{
      'border-primary ring-2 ring-primary/30': selected,
      'border-border/50': !selected,
      'border-blue-500/50': data.status === 'running',
      'border-red-500/50': data.status === 'error'
    }"
  >
    <!-- Header -->
    <div class="flex items-center gap-2 border-b border-border/30 px-3 py-2">
      <div
        class="size-2 shrink-0 rounded-full"
        :class="{
          'bg-muted-foreground/40': data.status === 'idle',
          'animate-pulse bg-blue-500': data.status === 'running',
          'bg-emerald-500': data.status === 'completed',
          'bg-red-500': data.status === 'error'
        }"
      />
      <span class="truncate text-xs font-medium text-muted-foreground">{{ data.model }}</span>
      <button
        class="ml-auto shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
        @click.stop="handleDelete"
      >
        <X class="size-3.5 text-muted-foreground hover:text-destructive" />
      </button>
    </div>

    <!-- Body -->
    <div class="px-3 pt-2.5 pb-3">
      <p class="truncate text-sm font-medium">{{ data.title }}</p>

      <!-- Response preview -->
      <div v-if="data.status === 'running'" class="mt-2 flex items-center gap-1.5">
        <Loader2 class="size-3 animate-spin text-blue-500" />
        <span class="text-xs text-muted-foreground">Generating...</span>
      </div>
      <p
        v-else-if="data.lastResponse"
        class="mt-2 line-clamp-4 text-xs leading-relaxed text-muted-foreground"
      >
        {{ data.lastResponse }}
      </p>
      <p v-else class="mt-2 text-xs text-muted-foreground/50">No response yet</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader2, X } from "lucide-vue-next";
import type { CanvasNode } from "~/stores/workspace";

const props = defineProps<{
  data: CanvasNode;
  selected?: boolean;
}>();

const deleteNode = inject<(id: string) => void>("deleteNode");

function handleDelete() {
  deleteNode?.(props.data.id);
}
</script>
