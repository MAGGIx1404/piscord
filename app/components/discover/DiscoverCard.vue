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
          Approval Required
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
            <BadgeCheck v-if="community.totalUsers > 10" class="size-4 shrink-0 text-primary" />
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
              : community.requiresApproval
                ? 'text-amber-500 hover:bg-amber-500/10'
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
          <template v-else-if="community.requiresApproval">
            <Lock class="mr-1 size-3.5" />
            Request
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

  <!-- Approval Request Modal -->
  <Dialog v-model:open="showApprovalModal">
    <DialogContent class="max-w-sm gap-0 overflow-hidden p-0">
      <!-- Decorative top band -->
      <div class="relative h-20 overflow-hidden bg-amber-500/10">
        <div class="absolute inset-0 flex items-center justify-center opacity-10">
          <Lock class="size-24 text-amber-500" />
        </div>
        <div
          class="absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-background/80 to-transparent"
        />
      </div>

      <!-- Community identity row, overlapping the band -->
      <div class="-mt-7 flex flex-col items-center px-6 pb-0">
        <Avatar class="mb-3 size-14 shadow-lg ring-4 ring-background">
          <AvatarImage :src="community.iconImage as string" />
          <AvatarFallback class="text-xl">{{ community.name.charAt(0) }}</AvatarFallback>
        </Avatar>
        <h2 class="text-base leading-tight font-semibold">{{ community.name }}</h2>
        <p class="mt-0.5 text-xs text-muted-foreground">
          {{ formatNumber(community.totalUsers) }} members
        </p>
      </div>

      <!-- Body -->
      <div class="px-6 pt-4 pb-2 text-center">
        <div
          class="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500"
        >
          <ShieldCheck class="size-3.5" />
          Approval Required
        </div>
        <p class="text-sm leading-relaxed text-muted-foreground">
          This community reviews join requests before letting new members in. Your request will be
          sent to the admins for review.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 px-6 pt-3 pb-6">
        <Button variant="outline" class="flex-1" @click="showApprovalModal = false"> Exit </Button>
        <Button
          class="flex-1 bg-amber-500 text-white hover:bg-amber-600"
          :disabled="isJoining"
          @click="confirmRequest"
        >
          <Loader2 v-if="isJoining" class="mr-1.5 size-3.5 animate-spin" />
          <Send v-else class="mr-1.5 size-3.5" />
          Send Request
        </Button>
      </div>
    </DialogContent>
  </Dialog>
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
  Loader2,
  Lock,
  Send
} from "lucide-vue-next";
import type { Community } from "./types";

interface Props {
  community: Community;
}

const props = defineProps<Props>();
const emit = defineEmits<{ join: [id: string, isRequest: boolean] }>();

const isJoining = ref(false);
const showApprovalModal = ref(false);

const handleJoin = () => {
  if (props.community.isMember || isJoining.value) return;
  if (props.community.requiresApproval) {
    showApprovalModal.value = true;
  } else {
    isJoining.value = true;
    emit("join", props.community.id, false);
    setTimeout(() => (isJoining.value = false), 1500);
  }
};

const confirmRequest = () => {
  isJoining.value = true;
  emit("join", props.community.id, true);
  setTimeout(() => {
    isJoining.value = false;
    showApprovalModal.value = false;
  }, 1500);
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
