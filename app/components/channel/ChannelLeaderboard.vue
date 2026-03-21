<template>
  <div class="rounded-2xl border border-border/50 bg-card/50">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 pt-5 pb-3">
      <div class="flex items-center gap-2">
        <Trophy class="size-4 text-amber-500" />
        <h3 class="text-sm font-semibold">Leaderboard</h3>
      </div>
      <span class="text-[11px] text-muted-foreground">This month</span>
    </div>

    <!-- Empty state -->
    <template v-if="!members.length">
      <div class="flex flex-col items-center justify-center px-5 py-10">
        <div class="flex size-12 items-center justify-center rounded-full bg-amber-500/10">
          <Trophy class="size-5 text-amber-500/40" />
        </div>
        <p class="mt-3 text-sm font-medium text-muted-foreground">No activity yet</p>
        <p class="mt-1 text-center text-xs text-muted-foreground/60">
          Start chatting in channels to appear on the leaderboard
        </p>
      </div>
    </template>

    <template v-else>
      <!-- Top podium -->
      <div class="flex items-end justify-center gap-3 px-4 pt-2 pb-4">
        <!-- 2nd place -->
        <div v-if="members[1]" class="flex flex-col items-center gap-1.5">
          <div class="relative">
            <Avatar class="size-10 ring-2 ring-zinc-400/40">
              <AvatarImage :src="members[1].avatar || ''" />
              <AvatarFallback class="text-xs">{{ members[1].name.charAt(0) }}</AvatarFallback>
            </Avatar>
            <span
              class="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-zinc-500 text-[10px] font-bold text-white ring-2 ring-card"
            >
              2
            </span>
          </div>
          <p class="max-w-16 truncate text-[11px] font-medium">{{ members[1].name }}</p>
          <span class="text-[10px] text-muted-foreground tabular-nums">{{ members[1].score }}</span>
        </div>

        <!-- 1st place -->
        <div class="flex flex-col items-center gap-1.5">
          <div class="relative">
            <div class="absolute -inset-1.5 animate-pulse rounded-full bg-amber-500/20 blur-sm" />
            <Avatar class="relative size-14 ring-2 ring-amber-500/60">
              <AvatarImage :src="members[0]?.avatar" />
              <AvatarFallback>{{ members[0]?.name?.charAt(0) }}</AvatarFallback>
            </Avatar>
            <span
              class="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white ring-2 ring-card"
            >
              1
            </span>
          </div>
          <p class="max-w-[72px] truncate text-xs font-semibold">{{ members[0]?.name }}</p>
          <span class="text-[10px] font-medium text-amber-500 tabular-nums">
            {{ members[0]?.score }}
          </span>
        </div>

        <!-- 3rd place -->
        <div v-if="members[2]" class="flex flex-col items-center gap-1.5">
          <div class="relative">
            <Avatar class="size-10 ring-2 ring-amber-700/30">
              <AvatarImage :src="members[2].avatar || ''" />
              <AvatarFallback class="text-xs">{{ members[2].name.charAt(0) }}</AvatarFallback>
            </Avatar>
            <span
              class="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-amber-700 text-[10px] font-bold text-white ring-2 ring-card"
            >
              3
            </span>
          </div>
          <p class="max-w-16 truncate text-[11px] font-medium">{{ members[2].name }}</p>
          <span class="text-[10px] text-muted-foreground tabular-nums">{{ members[2].score }}</span>
        </div>
      </div>

      <Separator />

      <!-- Ranked list (4th onwards) -->
      <div v-if="members.length > 3" class="space-y-0.5 px-2 py-2">
        <div
          v-for="(member, index) in members.slice(3)"
          :key="member.id"
          class="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/30"
        >
          <!-- Rank -->
          <span class="w-5 shrink-0 text-center text-xs text-muted-foreground tabular-nums">
            {{ index + 4 }}
          </span>

          <!-- Avatar -->
          <Avatar class="size-7">
            <AvatarImage :src="member.avatar" />
            <AvatarFallback class="text-[10px]">{{ member.name.charAt(0) }}</AvatarFallback>
          </Avatar>

          <!-- Name + role -->
          <div class="min-w-0 flex-1">
            <p class="truncate text-xs font-medium">{{ member.name }}</p>
            <p class="truncate text-[10px] text-muted-foreground">{{ member.role }}</p>
          </div>

          <!-- Score -->
          <span class="shrink-0 text-xs text-muted-foreground tabular-nums">
            {{ member.score }}
          </span>
        </div>
      </div>

      <!-- Stats legend -->
      <div class="border-t border-border/40 px-5 py-3">
        <div class="flex items-center justify-around">
          <div class="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <MessageSquare class="size-3" />
            <span>Messages</span>
          </div>
          <div class="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Heart class="size-3" />
            <span>Reactions</span>
          </div>
          <div class="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Flame class="size-3" />
            <span>Streak</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Trophy, MessageSquare, Heart, Flame } from "lucide-vue-next";

export interface LeaderboardMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  score: string;
}

defineProps<{
  members: LeaderboardMember[];
}>();
</script>
