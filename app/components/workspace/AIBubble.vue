<template>
  <Transition
    enter-active-class="transition-all duration-150 ease-out"
    enter-from-class="scale-95 opacity-0"
    enter-to-class="scale-100 opacity-100"
    leave-active-class="transition-all duration-100 ease-in"
    leave-from-class="scale-100 opacity-100"
    leave-to-class="scale-95 opacity-0"
  >
    <div
      v-if="visible"
      ref="menuRef"
      data-bubble-menu
      class="fixed z-50 flex items-center gap-0.5 rounded-xl border border-border/50 bg-popover/95 p-1 shadow-lg shadow-black/5 backdrop-blur-xl"
      :style="{ top: position.top + 'px', left: position.left + 'px' }"
    >
      <TooltipProvider :delay-duration="200">
        <Tooltip v-for="action in actions" :key="action.id">
          <TooltipTrigger as-child>
            <button
              class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
              :disabled="loading"
              @click="handleAction(action.id)"
            >
              <component :is="action.icon" class="size-3.5" />
              {{ action.label }}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" :side-offset="6" class="text-xs">
            {{ action.description }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <!-- Loading indicator -->
      <div v-if="loading" class="flex items-center gap-1.5 px-2 py-1.5">
        <div class="flex gap-0.5">
          <span class="size-1 animate-bounce rounded-full bg-primary/60 [animation-delay:0ms]" />
          <span class="size-1 animate-bounce rounded-full bg-primary/60 [animation-delay:150ms]" />
          <span class="size-1 animate-bounce rounded-full bg-primary/60 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { RefreshCw, AlignLeft, Sparkles, Expand, CheckCheck } from "lucide-vue-next";
import type { AIAction } from "~/composables/useLocalAI";

defineProps<{
  visible: boolean;
  position: { top: number; left: number };
  loading: boolean;
}>();

const emit = defineEmits<{
  action: [action: AIAction];
}>();

const menuRef = ref<HTMLElement | null>(null);

const actions = [
  {
    id: "rewrite" as AIAction,
    label: "Rewrite",
    icon: RefreshCw,
    description: "Rephrase selected text"
  },
  {
    id: "summarize" as AIAction,
    label: "Summarize",
    icon: AlignLeft,
    description: "Shorten the selection"
  },
  {
    id: "improve" as AIAction,
    label: "Improve",
    icon: Sparkles,
    description: "Enhance writing quality"
  },
  { id: "expand" as AIAction, label: "Expand", icon: Expand, description: "Add more detail" },
  {
    id: "fix_grammar" as AIAction,
    label: "Fix Grammar",
    icon: CheckCheck,
    description: "Fix spelling & grammar"
  }
];

function handleAction(action: AIAction) {
  emit("action", action);
}
</script>
