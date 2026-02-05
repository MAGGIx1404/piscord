<template>
  <div
    class="group relative overflow-hidden rounded-2xl bg-card/30 border border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
  >
    <!-- Poster Image -->
    <div class="relative h-36 overflow-hidden">
      <img
        :src="community.posterImage"
        :alt="community.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div class="absolute inset-0 bg-linear-to-t from-card to-transparent" />

      <!-- Category Badge -->
      <div class="absolute top-3 right-3">
        <Badge
          :class="getCategoryBadgeClass(community.type)"
          class="backdrop-blur-md bg-background/60"
        >
          <component :is="getCategoryIcon(community.type)" class="size-3" />
          {{ community.type }}
        </Badge>
      </div>

      <!-- Approval Badge -->
      <div v-if="community.requiresApproval" class="absolute top-3 left-3">
        <Badge
          variant="outline"
          class="backdrop-blur-md bg-background/60 border-amber-500/50 text-amber-500"
        >
          <ShieldCheck class="size-3 mr-1" />
          Invite Only
        </Badge>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5">
      <!-- Header -->
      <div class="flex items-start gap-3 mb-3">
        <Avatar class="size-12 -mt-8 ring-4 ring-card shrink-0">
          <AvatarImage :src="community.iconImage" />
          <AvatarFallback class="text-lg">{{ community.name.charAt(0) }}</AvatarFallback>
        </Avatar>
        <div class="min-w-0 pt-1">
          <div class="flex items-center gap-1.5">
            <h3 class="font-semibold truncate">{{ community.name }}</h3>
            <BadgeCheck v-if="community.totalUsers > 20000" class="size-4 text-primary shrink-0" />
          </div>
        </div>
      </div>

      <!-- Description -->
      <p class="text-sm text-muted-foreground line-clamp-2 mb-4">
        {{ community.description }}
      </p>

      <!-- Stats -->
      <div class="flex items-center justify-between pt-4 border-t border-border/50">
        <div class="flex items-center gap-4 text-xs text-muted-foreground">
          <span class="flex items-center gap-1.5">
            <Users class="size-3.5" />
            {{ formatNumber(community.totalUsers) }}
          </span>
          <span class="flex items-center gap-1.5">
            <span class="relative flex h-1.5 w-1.5">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
              ></span>
              <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            {{ formatNumber(Math.floor(community.totalUsers * 0.08)) }} online
          </span>
        </div>

        <Button size="sm" variant="secondary" class="h-8 px-3 text-primary hover:bg-primary/10">
          Join
          <ArrowRight class="size-3.5" />
        </Button>
      </div>
    </div>

    <!-- Hover Glow Effect -->
    <div
      class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
    >
      <div
        class="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Sparkles,
  Gamepad2,
  Code,
  BookOpen,
  Palette,
  Music,
  Users,
  BadgeCheck,
  ShieldCheck,
  ArrowRight
} from "lucide-vue-next";
import type { Community } from "./types";

interface Props {
  community: Community;
}

defineProps<Props>();

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const getCategoryIcon = (type: string) => {
  const icons: Record<string, any> = {
    gaming: Gamepad2,
    tech: Code,
    study: BookOpen,
    art: Palette,
    music: Music,
    fun: Users
  };
  return icons[type] || Sparkles;
};

const getCategoryBadgeClass = (type: string) => {
  const classes: Record<string, string> = {
    gaming: "text-purple-400 border-purple-500/30",
    tech: "text-blue-400 border-blue-500/30",
    study: "text-amber-400 border-amber-500/30",
    art: "text-pink-400 border-pink-500/30",
    music: "text-rose-400 border-rose-500/30",
    fun: "text-orange-400 border-orange-500/30"
  };
  return classes[type] || "text-primary border-primary/30";
};
</script>
