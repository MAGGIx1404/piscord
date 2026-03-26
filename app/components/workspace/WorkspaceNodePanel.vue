<template>
  <Sheet v-model:open="open">
    <SheetContent side="right" class="w-96 overflow-y-auto p-0">
      <div v-if="node" class="flex h-full flex-col">
        <!-- Header -->
        <div class="border-b border-border/50 p-4">
          <div class="flex items-center gap-2">
            <div
              class="size-2 rounded-full"
              :class="{
                'bg-muted-foreground/40': node.status === 'idle',
                'animate-pulse bg-blue-500': node.status === 'running',
                'bg-emerald-500': node.status === 'completed',
                'bg-red-500': node.status === 'error'
              }"
            />
            <Badge variant="outline" class="text-xs">{{ node.model }}</Badge>
            <Button
              variant="ghost"
              size="icon"
              class="ml-auto size-7 text-muted-foreground hover:text-destructive"
              @click="emit('delete', node.id)"
            >
              <Trash2 class="size-3.5" />
            </Button>
          </div>
          <h3 class="mt-2 text-base font-semibold">{{ node.title }}</h3>
          <p v-if="node.latency" class="text-xs text-muted-foreground">
            Last response: {{ node.latency }}ms
          </p>
        </div>

        <!-- Config -->
        <div class="border-b border-border/50 p-4">
          <h4 class="mb-3 text-xs font-medium text-muted-foreground uppercase">Configuration</h4>
          <div class="space-y-3">
            <div>
              <Label class="text-xs">Temperature</Label>
              <Input
                type="number"
                :model-value="node.config.temperature ?? 0.7"
                min="0"
                max="2"
                step="0.1"
                class="mt-1"
                @update:model-value="updateConfig('temperature', Number($event))"
              />
            </div>
            <div>
              <Label class="text-xs">Max Tokens</Label>
              <Input
                type="number"
                :model-value="node.config.max_tokens ?? 4096"
                min="1"
                max="128000"
                step="256"
                class="mt-1"
                @update:model-value="updateConfig('max_tokens', Number($event))"
              />
            </div>
            <div>
              <Label class="text-xs">System Prompt</Label>
              <Textarea
                :model-value="node.config.system_prompt ?? ''"
                placeholder="Optional system prompt..."
                class="mt-1 min-h-20 text-xs"
                @update:model-value="updateConfig('system_prompt', $event as string)"
              />
            </div>
          </div>
        </div>

        <!-- Conversation history -->
        <div class="flex-1 overflow-y-auto p-4">
          <h4 class="mb-3 text-xs font-medium text-muted-foreground uppercase">History</h4>
          <div v-if="messagesLoading" class="space-y-3">
            <Skeleton v-for="n in 3" :key="n" class="h-16 w-full rounded-lg" />
          </div>
          <div v-else-if="messages.length" class="space-y-3">
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="rounded-lg border border-border/30 p-3"
              :class="msg.role === 'user' ? 'bg-primary/5' : 'bg-card'"
            >
              <div class="mb-1 flex items-center gap-1.5">
                <Badge variant="outline" class="text-[10px]">{{ msg.role }}</Badge>
                <span class="text-[10px] text-muted-foreground">
                  {{ new Date(msg.created_at).toLocaleTimeString() }}
                </span>
              </div>
              <p class="text-xs leading-relaxed whitespace-pre-wrap">{{ msg.content }}</p>
            </div>
          </div>
          <p v-else class="text-center text-xs text-muted-foreground/50">No messages yet</p>
        </div>

        <!-- Run prompt -->
        <div class="border-t border-border/50 p-4">
          <div class="flex gap-2">
            <input
              v-model="singlePrompt"
              type="text"
              placeholder="Send prompt to this node..."
              class="min-w-0 flex-1 rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-xs outline-none focus:border-primary/50"
              @keydown.enter="handleSingleRun"
            />
            <Button size="sm" :disabled="!singlePrompt.trim()" @click="handleSingleRun">
              <Send class="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { Send, Trash2 } from "lucide-vue-next";
import type { CanvasNode } from "~/stores/workspace";
import type { NodeMessageItem } from "~~/server/services/nodeService";

const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
  node: CanvasNode | null;
  messages: NodeMessageItem[];
  messagesLoading: boolean;
}>();

const emit = defineEmits<{
  update: [nodeId: string, payload: Record<string, unknown>];
  run: [nodeId: string, prompt: string];
  delete: [nodeId: string];
}>();

const singlePrompt = ref("");

function updateConfig(key: string, value: unknown) {
  if (!props.node) return;
  const config = { ...props.node.config, [key]: value };
  emit("update", props.node.id, { config });
}

function handleSingleRun() {
  if (!props.node || !singlePrompt.value.trim()) return;
  emit("run", props.node.id, singlePrompt.value.trim());
  singlePrompt.value = "";
}
</script>
