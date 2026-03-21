<template>
  <div>
    <div class="border-b bg-violet-500/5 px-4 py-3">
      <div class="flex items-center gap-2">
        <div class="flex size-8 items-center justify-center rounded-full bg-violet-600">
          <Bot class="size-4 text-white" />
        </div>
        <div>
          <h4 class="text-sm font-semibold text-foreground">{{ aiAgent.name }}</h4>
          <p class="text-xs text-muted-foreground">AI Assistant</p>
        </div>
      </div>
    </div>

    <div class="space-y-3 px-4 py-3">
      <p class="text-xs text-muted-foreground">
        Mention
        <span class="font-mono text-violet-400">@{{ aiAgent.name }}</span>
        in your message to interact with the AI.
      </p>

      <div class="space-y-2">
        <h5 class="text-xs font-semibold text-foreground">Things you can ask</h5>

        <div class="space-y-1.5">
          <div class="flex items-start gap-2 rounded-md bg-accent/50 px-2.5 py-2">
            <MessageSquare class="mt-0.5 size-3 shrink-0 text-muted-foreground" />
            <p class="text-xs text-muted-foreground">
              Ask questions, get explanations, or discuss ideas
            </p>
          </div>

          <div class="flex items-start gap-2 rounded-md bg-accent/50 px-2.5 py-2">
            <Send class="mt-0.5 size-3 shrink-0 text-muted-foreground" />
            <p class="text-xs text-muted-foreground">
              <span class="font-mono text-foreground/80">
                @{{ aiAgent.name }} send a message saying welcome!
              </span>
            </p>
          </div>

          <div
            class="flex items-start gap-2 rounded-md px-2.5 py-2"
            :class="canManage ? 'bg-accent/50' : 'bg-accent/30 opacity-50'"
          >
            <Plus class="mt-0.5 size-3 shrink-0 text-muted-foreground" />
            <div>
              <p class="text-xs text-muted-foreground">
                <span class="font-mono text-foreground/80">
                  @{{ aiAgent.name }} create a channel called updates
                </span>
              </p>
              <p v-if="!canManage" class="mt-0.5 text-[10px] text-amber-500">Admin / Owner only</p>
            </div>
          </div>

          <div
            class="flex items-start gap-2 rounded-md px-2.5 py-2"
            :class="canManage ? 'bg-accent/50' : 'bg-accent/30 opacity-50'"
          >
            <Plus class="mt-0.5 size-3 shrink-0 text-muted-foreground" />
            <div>
              <p class="text-xs text-muted-foreground">
                <span class="font-mono text-foreground/80">
                  @{{ aiAgent.name }} create a workspace called design
                </span>
              </p>
              <p v-if="!canManage" class="mt-0.5 text-[10px] text-amber-500">Admin / Owner only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bot, MessageSquare, Send, Plus } from "lucide-vue-next";

defineProps<{
  aiAgent: { name: string | null };
  canManage: boolean;
}>();
</script>
