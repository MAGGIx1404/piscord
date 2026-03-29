<template>
  <div class="fixed bottom-28 left-1/2 z-40 w-full max-w-2xl -translate-x-1/2 px-4">
    <!-- Suggestion chips -->
    <div v-if="suggestions.length && selectedCount > 0 && aiEnabled" class="mb-2 flex flex-wrap gap-1.5">
      <button
        v-for="s in suggestions"
        :key="s.id"
        class="rounded-full border border-border/50 bg-card/90 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/50 hover:text-foreground"
        @click="emit('submit', s.prompt)"
      >
        {{ s.label }}
      </button>
    </div>

    <!-- Template row -->
    <div v-if="showTemplates && aiEnabled" class="mb-2 flex gap-1.5 overflow-x-auto scrollbar-none">
      <button
        v-for="t in templates"
        :key="t.id"
        class="flex shrink-0 items-center gap-1 rounded-lg border border-border/40 bg-card/80 px-2.5 py-1.5 text-xs text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/50 hover:text-foreground"
        @click="handleTemplateClick(t)"
      >
        <span>{{ t.emoji }}</span>
        <span>{{ t.name }}</span>
      </button>
    </div>

    <!-- Main bar -->
    <div
      class="flex items-center gap-3 rounded-xl border border-border/60 bg-card/95 px-4 py-2.5 shadow-xl backdrop-blur-xl"
    >
      <!-- Selected count -->
      <span v-if="selectedCount > 0" class="shrink-0 text-xs text-muted-foreground">
        {{ selectedCount }} node{{ selectedCount !== 1 ? "s" : "" }}
      </span>
      <span v-else class="shrink-0 text-xs text-muted-foreground/50">No nodes selected</span>

      <Separator orientation="vertical" class="h-5" />

      <!-- AI status indicator -->
      <div
        v-if="!aiEnabled"
        class="flex shrink-0 items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground/60"
      >
        <ZapOff class="size-3" />
        AI off
      </div>

      <!-- Input -->
      <input
        v-model="prompt"
        type="text"
        :placeholder="aiEnabled ? 'Enter a prompt to send to selected nodes...' : 'Turn on AI to send prompts'"
        class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
        :disabled="isRunning || selectedCount === 0 || !aiEnabled"
        @input="onInput"
        @keydown.enter="handleSubmit"
        @focus="showTemplates = true"
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
import { Send, Loader2, ZapOff } from "lucide-vue-next";
import type { Suggestion } from "~/composables/useSuggestions";

interface Template {
  id: string;
  name: string;
  emoji: string;
  template: string;
}

const props = defineProps<{
  selectedCount: number;
  isRunning: boolean;
  aiEnabled: boolean;
  suggestions: Suggestion[];
  templates: Template[];
}>();

const emit = defineEmits<{
  submit: [prompt: string];
  inputChange: [text: string];
}>();

const prompt = ref("");
const showTemplates = ref(false);
const canSubmit = computed(
  () => prompt.value.trim().length > 0 && props.selectedCount > 0 && !props.isRunning && props.aiEnabled
);

function onInput() {
  emit("inputChange", prompt.value);
  showTemplates.value = false;
}

function handleSubmit() {
  if (!canSubmit.value) return;
  emit("submit", prompt.value.trim());
  prompt.value = "";
  showTemplates.value = false;
}

function handleTemplateClick(t: Template) {
  prompt.value = t.template.replace("{input}", "");
  showTemplates.value = false;
}
</script>
