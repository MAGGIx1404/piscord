<template>
  <div
    class="relative mx-auto max-w-lg overflow-hidden rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-20"
  >
    <div
      class="pointer-events-none absolute inset-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <span
        v-for="(pos, i) in hashPositions"
        :key="i"
        class="absolute font-mono font-bold text-primary/10"
        :style="{
          top: pos.top,
          left: pos.left,
          fontSize: pos.size,
          transform: `rotate(${pos.rot})`
        }"
        >#</span
      >
    </div>
    <div class="relative flex flex-col items-center">
      <div
        class="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/20"
      >
        <Hash class="size-7 text-primary" />
      </div>
      <p class="text-base font-medium text-foreground/80">No channels yet</p>
      <p class="mt-1 text-center text-sm text-muted-foreground">
        Channels are where conversations happen.
        <template v-if="canManage">Create the first one to get started.</template>
      </p>
      <Button
        v-if="canManage"
        size="sm"
        variant="outline"
        class="mt-5 gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
        @click="$emit('create')"
      >
        <Plus class="size-3.5" />
        Create a channel
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Hash, Plus } from "lucide-vue-next";

defineProps<{
  canManage: boolean;
}>();

defineEmits<{
  create: [];
}>();

const hashPositions = [
  { top: "8%", left: "4%", size: "2rem", rot: "-15deg" },
  { top: "12%", left: "80%", size: "1.4rem", rot: "10deg" },
  { top: "55%", left: "90%", size: "2.4rem", rot: "-8deg" },
  { top: "70%", left: "2%", size: "1.6rem", rot: "18deg" },
  { top: "85%", left: "50%", size: "1.2rem", rot: "-5deg" }
];
</script>
