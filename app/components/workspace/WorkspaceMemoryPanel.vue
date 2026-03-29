<template>
  <Sheet v-model:open="open">
    <SheetContent side="right" class="flex w-96 flex-col gap-0 p-0 sm:max-w-96">
      <div class="shrink-0 border-b border-border/50 px-5 py-4">
        <div class="flex items-center gap-2">
          <Brain class="size-4 text-muted-foreground" />
          <h3 class="text-sm font-semibold">Workspace Memory</h3>
          <Badge variant="outline" class="ml-auto text-[10px]">{{ memories.length }} items</Badge>
        </div>
        <p class="mt-1 text-xs text-muted-foreground/60">
          Notes and highlights injected into AI prompts as context.
        </p>
      </div>

      <!-- Add new memory -->
      <div class="shrink-0 border-b border-border/50 p-4">
        <div class="flex gap-2">
          <input
            v-model="newNote"
            type="text"
            placeholder="Add a note or context..."
            class="min-w-0 flex-1 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-xs outline-none focus:border-primary/50"
            @keydown.enter="handleAdd"
          />
          <Button size="sm" :disabled="!newNote.trim()" @click="handleAdd">
            <Plus class="size-3.5" />
          </Button>
        </div>
      </div>

      <!-- Memory items -->
      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="memories.length" class="space-y-2">
          <div
            v-for="mem in memories"
            :key="mem.id"
            class="group flex items-start gap-2 rounded-lg border border-border/30 p-3"
          >
            <Badge variant="outline" class="shrink-0 text-[9px]">{{ mem.type }}</Badge>
            <p class="min-w-0 flex-1 text-xs leading-relaxed">{{ mem.content }}</p>
            <button
              class="shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10"
              @click="emit('delete', mem.id)"
            >
              <X class="size-3.5 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </div>
        <div v-else class="flex h-40 flex-col items-center justify-center gap-2">
          <Brain class="size-8 text-muted-foreground/20" />
          <p class="text-xs text-muted-foreground/40">No memories yet</p>
          <p class="text-center text-[10px] text-muted-foreground/30">
            Add notes to give AI context about your project
          </p>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { Brain, Plus, X } from "lucide-vue-next";
import type { MemoryItem } from "~/stores/workspace";

const open = defineModel<boolean>("open", { default: false });

defineProps<{
  memories: MemoryItem[];
}>();

const emit = defineEmits<{
  add: [content: string, type: string];
  delete: [id: string];
}>();

const newNote = ref("");

function handleAdd() {
  if (!newNote.value.trim()) return;
  emit("add", newNote.value.trim(), "note");
  newNote.value = "";
}
</script>
