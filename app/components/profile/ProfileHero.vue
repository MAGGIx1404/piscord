<template>
  <div class="w-full relative">
    <WidgetsImagePoster :src="bannerImage" size="lg" />

    <!-- Profile Card Overlay -->
    <div class="w-full -mt-24 relative z-10 px-6">
      <Card class="p-6 backdrop-blur-xl bg-card/90 shadow-2xl">
        <div class="flex flex-col md:flex-row gap-6">
          <!-- Avatar Section -->
          <div class="relative shrink-0">
            <div class="relative group">
              <div
                class="absolute -inset-1 bg-linear-to-r from-primary via-purple-500 to-pink-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500"
              />
              <Avatar class="relative size-32 ring-4 ring-card">
                <AvatarImage :src="avatarImage" />
                <AvatarFallback class="text-3xl">{{ avatarFallback }}</AvatarFallback>
              </Avatar>
              <!-- Status indicator -->
              <span v-if="showStatus" class="absolute bottom-2 right-2 flex size-5">
                <span
                  v-if="isOnline"
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                />
                <span
                  class="relative inline-flex rounded-full size-5 border-3 border-card"
                  :class="isOnline ? 'bg-green-500' : 'bg-gray-500'"
                />
              </span>
            </div>
          </div>

          <!-- User Info -->
          <div class="flex-1 space-y-4">
            <div class="flex items-start justify-between flex-wrap gap-4">
              <div class="w-auto">
                <div class="flex items-center gap-2">
                  <h1 class="text-2xl font-bold">{{ displayName }}</h1>
                  <Badge v-if="isPremium" class="bg-purple-500 text-primary">
                    <Sparkles class="size-4" />
                    Premium
                  </Badge>
                  <slot name="badges" />
                </div>
                <p class="text-sm text-muted-foreground">
                  @{{ username }}
                  <span v-if="joinedDate"> • Joined {{ joinedDate }}</span>
                </p>
              </div>
              <div class="flex gap-2">
                <slot name="actions">
                  <Button v-if="isOwnProfile" variant="outline" size="sm" @click="$emit('edit')">
                    <Settings class="size-4" />
                    Edit Profile
                  </Button>
                  <Button size="sm" @click="$emit('share')">
                    <Share2 class="size-4" />
                    Share
                  </Button>
                </slot>
              </div>
            </div>

            <!-- Bio -->
            <p v-if="bio" class="text-sm max-w-xl">{{ bio }}</p>

            <!-- Quick Stats -->
            <div v-if="stats.length" class="flex flex-wrap gap-5">
              <Button v-for="stat in stats" :key="stat.label" variant="link" size="link">
                <component :is="stat.icon" class="size-4 text-purple-500" />
                {{ stat.value }} {{ stat.label }}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Settings, Share2, Sparkles } from "lucide-vue-next";
import type { Component } from "vue";

interface Stat {
  icon: Component;
  value: string | number;
  label: string;
}

interface Props {
  displayName: string;
  username: string;
  avatarImage?: string;
  avatarFallback?: string;
  bannerImage?: string;
  bio?: string;
  joinedDate?: string;
  isOnline?: boolean;
  showStatus?: boolean;
  isPremium?: boolean;
  isOwnProfile?: boolean;
  stats?: Stat[];
}

withDefaults(defineProps<Props>(), {
  avatarImage: "",
  avatarFallback: "??",
  bannerImage: "/images/servers/p-3.jpg",
  bio: "",
  joinedDate: "",
  isOnline: false,
  showStatus: true,
  isPremium: false,
  isOwnProfile: false,
  stats: () => []
});

defineEmits<{
  edit: [];
  share: [];
}>();
</script>
