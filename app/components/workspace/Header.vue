<template>
  <div class="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
    <div class="flex items-center gap-2.5">
      <NuxtLink
        :to="`/community/${communityId}/workspaces`"
        class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        <ArrowLeft class="size-4" />
      </NuxtLink>

      <div class="flex items-center gap-2">
        <span v-if="emoji" class="text-base">{{ emoji }}</span>
        <input
          :value="name"
          class="bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground/40 focus:underline focus:decoration-primary/40 focus:underline-offset-4"
          placeholder="Untitled"
          @input="$emit('update:name', ($event.target as HTMLInputElement).value)"
          @blur="$emit('saveTitle')"
          @keydown.enter="($event.target as HTMLInputElement).blur()"
        />
      </div>
    </div>

    <div class="flex items-center gap-2">
      <!-- Online collaborators -->
      <div v-if="onlineUsers.length > 0" class="flex items-center">
        <div class="flex -space-x-1.5">
          <TooltipProvider :delay-duration="200">
            <Tooltip v-for="user in onlineUsers.slice(0, 5)" :key="user.userId">
              <TooltipTrigger as-child>
                <Avatar class="size-6 ring-2 ring-background">
                  <AvatarImage :src="user.avatar_url ?? ''" :alt="user.username" />
                  <AvatarFallback class="text-[9px]">
                    {{ user.username?.slice(0, 2).toUpperCase() }}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom" :side-offset="4" class="text-xs">
                {{ user.username }}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span v-if="onlineUsers.length > 5" class="ml-1 text-[10px] text-muted-foreground">
          +{{ onlineUsers.length - 5 }}
        </span>
      </div>

      <!-- Connection indicator -->
      <TooltipProvider :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <div class="flex items-center gap-1 rounded-lg px-2 py-1">
              <span
                class="size-1.5 rounded-full"
                :class="connected ? 'bg-emerald-500' : 'animate-pulse bg-amber-500'"
              />
              <span class="text-[10px] text-muted-foreground">
                {{ connected ? "Live" : "Connecting..." }}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" :side-offset="4" class="text-xs">
            {{ connected ? "Real-time sync active" : "Reconnecting..." }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div class="mx-1 h-4 w-px bg-border/30" />

      <!-- Thoughts toggle -->
      <TooltipProvider :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all"
              :class="
                showThoughts
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              "
              @click="$emit('update:showThoughts', !showThoughts)"
            >
              <Lightbulb class="size-3.5" />
              <span class="hidden sm:inline">Thoughts</span>
              <Badge
                v-if="thoughtsCount"
                variant="secondary"
                class="ml-0.5 h-4 min-w-4 px-1 text-[9px]"
              >
                {{ thoughtsCount }}
              </Badge>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" :side-offset="4" class="text-xs">
            Toggle thoughts panel
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Lightbulb } from "lucide-vue-next";

export interface CollabUser {
  userId: string;
  username: string;
  avatar_url: string | null;
}

defineProps<{
  communityId: string;
  name: string;
  emoji: string | null;
  onlineUsers: CollabUser[];
  connected: boolean;
  showThoughts: boolean;
  thoughtsCount: number;
}>();

defineEmits<{
  "update:name": [value: string];
  "update:showThoughts": [value: boolean];
  saveTitle: [];
}>();
</script>
