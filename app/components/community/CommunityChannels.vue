<template>
  <Card>
    <div class="flex items-center justify-between">
      <h3 class="font-semibold flex items-center gap-2">
        <Hash class="size-4" />
        Channels
      </h3>
      <Button variant="ghost" size="sm" @click="$emit('create')">
        <Plus class="size-4" />
        New Channel
      </Button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <div
        v-for="channel in channels"
        :key="channel.id"
        class="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer group"
        @click="$emit('select', channel)"
      >
        <div class="size-10 rounded-lg flex items-center justify-center" :class="channel.iconBg">
          <component :is="channel.icon" class="size-5" :class="channel.iconColor" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm truncate"># {{ channel.name }}</p>
          <p class="text-xs text-muted-foreground">{{ channel.lastActivity }}</p>
        </div>
        <div class="flex items-center gap-1 text-xs text-muted-foreground">
          <MessageSquare class="size-3" />
          {{ channel.messageCount }}
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Hash, Plus, MessageSquare } from "lucide-vue-next";
import type { Component } from "vue";

interface Channel {
  id: number | string;
  name: string;
  icon: Component;
  iconBg: string;
  iconColor: string;
  lastActivity: string;
  messageCount: string;
}

interface Props {
  channels: Channel[];
}

defineProps<Props>();

defineEmits<{
  create: [];
  select: [channel: Channel];
}>();
</script>
