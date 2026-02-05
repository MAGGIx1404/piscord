<template>
  <div class="rounded-2xl bg-card border border-border/50 overflow-hidden">
    <!-- Header with live pulse -->
    <div class="p-5 border-b border-border/50 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="relative">
          <div class="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap class="size-5 text-primary" />
          </div>
          <span
            class="absolute -top-0.5 -right-0.5 size-3 bg-green-500 rounded-full border-2 border-card"
          />
        </div>
        <div>
          <h3 class="font-semibold">Community Pulse</h3>
          <p class="text-xs text-muted-foreground">What's happening right now</p>
        </div>
      </div>
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <span class="size-1.5 rounded-full bg-green-500 animate-pulse" />
        Live
      </div>
    </div>

    <!-- Quick stats row -->
    <div class="grid grid-cols-3 divide-x divide-border/50">
      <div class="p-4 text-center">
        <p class="text-2xl font-bold text-primary">{{ activeNow }}</p>
        <p class="text-xs text-muted-foreground">Active now</p>
      </div>
      <div class="p-4 text-center">
        <p class="text-2xl font-bold">{{ todayMessages }}</p>
        <p class="text-xs text-muted-foreground">Today's messages</p>
      </div>
      <div class="p-4 text-center">
        <p class="text-2xl font-bold text-green-500">+{{ newMembers }}</p>
        <p class="text-xs text-muted-foreground">New members</p>
      </div>
    </div>

    <!-- Hot topics -->
    <div class="p-5 space-y-3 border-t border-border/50">
      <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Trending discussions
      </p>
      <div class="space-y-2">
        <button
          v-for="topic in trendingTopics"
          :key="topic.id"
          class="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-left group"
          @click="$emit('selectTopic', topic)"
        >
          <div
            class="size-8 rounded-lg flex items-center justify-center shrink-0"
            :class="topic.iconBg"
          >
            <component :is="topic.icon" class="size-4" :class="topic.iconColor" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate group-hover:text-primary transition-colors">
              {{ topic.title }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ topic.replies }} replies • {{ topic.channel }}
            </p>
          </div>
        </button>
      </div>
    </div>

    <!-- Upcoming event banner -->
    <div
      v-if="upcomingEvent"
      class="m-5 mt-0 p-4 rounded-xl bg-linear-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20"
    >
      <div class="flex items-center gap-4">
        <div class="size-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <CalendarDays class="size-6 text-primary" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-primary font-medium">UPCOMING EVENT</p>
          <p class="font-semibold truncate">{{ upcomingEvent.title }}</p>
          <p class="text-sm text-muted-foreground">
            {{ upcomingEvent.time }} • {{ upcomingEvent.attendees }} going
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          class="shrink-0"
          @click="$emit('joinEvent', upcomingEvent)"
        >
          Join
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Zap, CalendarDays, Flame, Sparkles } from "lucide-vue-next";
import { markRaw, type Component } from "vue";

interface TrendingTopic {
  id: string | number;
  title: string;
  replies: number;
  channel: string;
  icon: Component;
  iconBg: string;
  iconColor: string;
}

interface UpcomingEvent {
  id: string | number;
  title: string;
  time: string;
  attendees: number;
}

interface Props {
  activeNow?: number;
  todayMessages?: number;
  newMembers?: number;
  trendingTopics?: TrendingTopic[];
  upcomingEvent?: UpcomingEvent | null;
}

withDefaults(defineProps<Props>(), {
  activeNow: 47,
  todayMessages: 128,
  newMembers: 12,
  trendingTopics: () => [
    {
      id: 1,
      title: "New project showcase thread",
      replies: 42,
      channel: "#dev-talk",
      icon: markRaw(Flame),
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-500"
    },
    {
      id: 2,
      title: "Weekend gaming tournament",
      replies: 28,
      channel: "#gaming",
      icon: markRaw(Sparkles),
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-500"
    }
  ],
  upcomingEvent: () => ({
    id: 1,
    title: "Community Game Night",
    time: "Saturday, 8 PM EST",
    attendees: 24
  })
});

defineEmits<{
  selectTopic: [topic: TrendingTopic];
  joinEvent: [event: UpcomingEvent];
}>();
</script>
