<template>
  <div
    class="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 transition-all duration-300"
  >
    <!-- Poster Image -->
    <div class="relative h-36 overflow-hidden">
      <img
        :src="community.posterImage ?? undefined"
        :alt="community.name"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-linear-to-t from-card to-transparent" />

      <!-- Category Badge -->
      <div class="absolute top-3 right-3">
        <Badge
          :class="getCategoryBadgeClass(community.type)"
          class="bg-background/60 backdrop-blur-md"
        >
          <component :is="getCategoryIcon(community.type)" class="size-3" />
          {{ community.type }}
        </Badge>
      </div>

      <!-- Approval Badge -->
      <div v-if="community.requiresApproval" class="absolute top-3 left-3">
        <Badge
          variant="outline"
          class="border-amber-500/50 bg-background/60 text-amber-500 backdrop-blur-md"
        >
          <ShieldCheck class="mr-1 size-3" />
          Invite Only
        </Badge>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5">
      <!-- Header -->
      <div class="mb-3 flex items-start gap-3">
        <Avatar class="-mt-8 size-12 shrink-0 ring-4 ring-card">
          <AvatarImage :src="community.iconImage as string" />
          <AvatarFallback class="text-lg">{{ community.name.charAt(0) }}</AvatarFallback>
        </Avatar>
        <div class="min-w-0 pt-1">
          <div class="flex items-center gap-1.5">
            <h3 class="truncate font-semibold">{{ community.name }}</h3>
            <BadgeCheck v-if="community.totalUsers > 20000" class="size-4 shrink-0 text-primary" />
          </div>
        </div>
      </div>

      <!-- Description -->
      <p class="mb-4 line-clamp-2 text-sm text-muted-foreground">
        {{ community.description }}
      </p>

      <!-- Stats -->
      <div class="flex items-center justify-between border-t border-border/50 pt-4">
        <div class="flex items-center gap-4 text-xs text-muted-foreground">
          <span class="flex items-center gap-1.5">
            <Users class="size-3.5" />
            {{ formatNumber(community.totalUsers) }}
          </span>
          <span class="flex items-center gap-1.5">
            <span class="relative flex h-1.5 w-1.5">
              <span
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
              ></span>
              <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            </span>
            {{ formatNumber(Math.floor(community.totalUsers * 0.08)) }} online
          </span>
        </div>

        <Button
          size="sm"
          :variant="community.isMember ? 'outline' : 'secondary'"
          class="h-8 px-3"
          :class="
            community.isMember
              ? 'border-emerald-500/30 text-emerald-500'
              : 'text-primary hover:bg-primary/10'
          "
          :disabled="community.isMember || isJoining"
          @click="handleJoin"
        >
          <template v-if="community.isMember">
            <BadgeCheck class="mr-1 size-3.5" />
            Joined
          </template>
          <template v-else-if="isJoining">
            <Loader2 class="size-3.5 animate-spin" />
          </template>
          <template v-else>
            Join
            <ArrowRight class="size-3.5" />
          </template>
        </Button>
      </div>
    </div>

    <!-- Hover Glow Effect -->
    <div
      class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
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
  ArrowRight,
  Loader2
} from "lucide-vue-next";
import type { Community } from "./types";

interface Props {
  community: Community;
}

const props = defineProps<Props>();
const emit = defineEmits<{ join: [id: string] }>();

const isJoining = ref(false);

const handleJoin = async () => {
  if (props.community.isMember || isJoining.value) return;
  isJoining.value = true;
  emit("join", props.community.id);
  // parent controls the isMember state; reset after short delay
  setTimeout(() => (isJoining.value = false), 1500);
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const getCategoryIcon = (type: string | null) => {
  const icons: Record<string, any> = {
    gaming: Gamepad2,
    tech: Code,
    study: BookOpen,
    art: Palette,
    music: Music,
    fun: Users
  };
  return icons[type ?? ""] || Sparkles;
};

const getCategoryBadgeClass = (type: string | null) => {
  const classes: Record<string, string> = {
    gaming: "text-purple-400 border-purple-500/30",
    tech: "text-blue-400 border-blue-500/30",
    study: "text-amber-400 border-amber-500/30",
    art: "text-pink-400 border-pink-500/30",
    music: "text-rose-400 border-rose-500/30",
    fun: "text-orange-400 border-orange-500/30"
  };
  return classes[type ?? ""] || "text-primary border-primary/30";
};
</script>
