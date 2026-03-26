<template>
  <div class="fixed bottom-28 left-1/2 z-40 w-full max-w-2xl -translate-x-1/2 px-4">
    <div
      class="flex items-center gap-3 rounded-xl border border-border/60 bg-card/95 px-4 py-2.5 shadow-xl backdrop-blur-xl"
    >
      <!-- Selected count -->
      <span v-if="selectedCount > 0" class="shrink-0 text-xs text-muted-foreground">
        {{ selectedCount }} node{{ selectedCount !== 1 ? "s" : "" }}
      </span>
      <span v-else class="shrink-0 text-xs text-muted-foreground/50">No nodes selected</span>

      <Separator orientation="vertical" class="h-5" />

      <!-- Input -->
      <input
        v-model="prompt"
        type="text"
        placeholder="Enter a prompt to send to selected nodes..."
        class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
        :disabled="isRunning || selectedCount === 0"
        @keydown.enter="handleSubmit"
      />

      <!-- Send button -->
      <Button size="icon" class="size-8 shrink-0" :disabled="!canSubmit" @click="handleSubmit">
        <Loader2 v-if="isRunning" class="size-4 animate-spin" />
        <Send v-else class="size-4" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Send, Loader2 } from "lucide-vue-next";

const props = defineProps<{
  selectedCount: number;
  isRunning: boolean;
}>();

const emit = defineEmits<{
  submit: [prompt: string];
}>();

const prompt = ref("");
const canSubmit = computed(
  () => prompt.value.trim().length > 0 && props.selectedCount > 0 && !props.isRunning
);

function handleSubmit() {
  if (!canSubmit.value) return;
  emit("submit", prompt.value.trim());
  prompt.value = "";
}
</script>
