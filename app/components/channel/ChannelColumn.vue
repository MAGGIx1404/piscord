<template>
  <div class="flex flex-col">
    <!-- Column header -->
    <div
      class="mb-3 flex items-center justify-between rounded-xl border border-border/50 bg-card/60 px-4 py-3 backdrop-blur-sm"
    >
      <div class="flex items-center gap-2.5">
        <div class="flex size-10 items-center justify-center rounded-lg" :class="columnStyle.bg">
          <component :is="columnStyle.icon" class="size-4" :class="columnStyle.color" />
        </div>
        <div>
          <p class="text-sm font-semibold capitalize">{{ label }}</p>
          <p class="text-[11px] text-muted-foreground">
            {{ channels.length }} channel{{ channels.length !== 1 ? "s" : "" }}
          </p>
        </div>
      </div>
      <Button v-if="canManage" variant="ghost" @click="$emit('create', type)">
        <Plus class="size-4" />
      </Button>
    </div>

    <!-- Channel cards -->
    <div class="flex flex-1 flex-col gap-3">
      <LazyChannelCard
        v-for="channel in channels"
        :key="channel.id"
        :channel="channel"
        :icon="columnStyle.icon"
        :icon-color="columnStyle.color"
        :poster-bg="columnStyle.posterBg"
        @select="(ch) => $emit('select', ch)"
      />

      <!-- Column empty state -->
      <div
        v-if="!channels.length"
        class="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/10 px-4 py-10"
      >
        <component :is="columnStyle.icon" class="size-6 text-muted-foreground/20" />
        <p class="text-xs text-muted-foreground/50">No {{ label }} channels</p>
        <Button
          v-if="canManage"
          variant="ghost"
          size="sm"
          class="text-primary"
          @click="$emit('create', type)"
        >
          + Create one
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from "lucide-vue-next";
import type { Component } from "vue";
import type { ChannelCardItem } from "./ChannelCard.vue";

interface ColumnStyle {
  icon: Component;
  bg: string;
  color: string;
  posterBg: string;
}

defineProps<{
  type: string;
  label: string;
  columnStyle: ColumnStyle;
  channels: ChannelCardItem[];
  canManage: boolean;
}>();

defineEmits<{
  create: [type: string];
  select: [channel: ChannelCardItem];
}>();
</script>
