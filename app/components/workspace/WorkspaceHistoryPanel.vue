<template>
  <Sheet v-model:open="open">
    <SheetContent side="right" class="w-[420px] overflow-y-auto p-0">
      <div class="flex h-full flex-col">
        <!-- Header -->
        <div class="border-b border-border/50 px-5 py-4">
          <div class="flex items-center gap-2">
            <History class="size-4 text-muted-foreground" />
            <h3 class="text-sm font-semibold">Workspace History</h3>
          </div>
          <p class="mt-1 text-xs text-muted-foreground">All AI conversations across nodes</p>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="loading" class="space-y-3 p-5">
            <Skeleton v-for="n in 5" :key="n" class="h-20 w-full rounded-lg" />
          </div>

          <div v-else-if="groupedHistory.length" class="divide-y divide-border/30">
            <div v-for="group in groupedHistory" :key="group.nodeId" class="p-4">
              <!-- Node heading -->
              <button
                class="mb-2 flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left transition-colors hover:bg-muted/50"
                @click="$emit('openNode', group.nodeId)"
              >
                <div
                  class="size-2 shrink-0 rounded-full"
                  :class="{
                    'bg-muted-foreground/40': group.status === 'idle',
                    'animate-pulse bg-blue-500': group.status === 'running',
                    'bg-emerald-500': group.status === 'completed',
                    'bg-red-500': group.status === 'error'
                  }"
                />
                <span class="truncate text-xs font-medium">{{ group.title }}</span>
                <Badge variant="outline" class="ml-auto text-[10px]">{{ group.model }}</Badge>
              </button>

              <!-- Messages -->
              <div class="space-y-2 pl-4">
                <div
                  v-for="msg in group.messages.slice(-6)"
                  :key="msg.id"
                  class="rounded-lg px-3 py-2"
                  :class="msg.role === 'user' ? 'bg-primary/5' : 'bg-muted/30'"
                >
                  <div class="mb-0.5 flex items-center gap-1.5">
                    <span
                      class="text-[10px] font-medium"
                      :class="msg.role === 'user' ? 'text-primary' : 'text-muted-foreground'"
                    >
                      {{ msg.role === "user" ? "You" : group.model }}
                    </span>
                    <span class="text-[10px] text-muted-foreground/50">
                      {{ formatTime(msg.created_at) }}
                    </span>
                  </div>
                  <p class="line-clamp-3 text-xs leading-relaxed whitespace-pre-wrap">
                    {{ msg.content }}
                  </p>
                </div>
                <button
                  v-if="group.messages.length > 6"
                  class="w-full rounded py-1 text-center text-[10px] text-muted-foreground hover:text-foreground"
                  @click="$emit('openNode', group.nodeId)"
                >
                  View all {{ group.messages.length }} messages
                </button>
              </div>
            </div>
          </div>

          <div v-else class="flex h-full flex-col items-center justify-center gap-2 p-5">
            <MessageSquare class="size-8 text-muted-foreground/20" />
            <p class="text-xs text-muted-foreground/50">No history yet</p>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { History, MessageSquare } from "lucide-vue-next";

interface HistoryMessage {
  id: string;
  node_id: string;
  role: string;
  content: string;
  created_at: Date;
}

interface NodeHistoryGroup {
  nodeId: string;
  title: string;
  model: string;
  status: string;
  messages: HistoryMessage[];
}

const open = defineModel<boolean>("open", { default: false });

defineProps<{
  groupedHistory: NodeHistoryGroup[];
  loading: boolean;
}>();

defineEmits<{
  openNode: [nodeId: string];
}>();

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
</script>
