<template>
  <div class="rounded-2xl border border-border/50 overflow-hidden bg-card/30">
    <div class="px-4 py-3 border-b border-border/50 flex items-center gap-2">
      <Eye class="size-4 text-muted-foreground" />
      <span class="text-sm font-medium">Live Preview</span>
    </div>
    <div class="relative">
      <!-- Banner -->
      <div class="h-36 relative">
        <img v-if="bannerPreview" :src="bannerPreview" class="w-full h-full object-cover" />
        <div
          v-else
          class="w-full h-full bg-linear-to-r from-primary/30 via-purple-500/30 to-pink-500/30"
        />
      </div>

      <!-- Content -->
      <div class="px-4 pb-4">
        <!-- Avatar overlapping banner -->
        <div class="-mt-8 mb-3 relative z-10">
          <div class="size-16 rounded-xl bg-card border-4 border-card overflow-hidden shadow-lg">
            <img v-if="iconPreview" :src="iconPreview" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-muted flex items-center justify-center">
              <Users class="size-6 text-muted-foreground" />
            </div>
          </div>
        </div>
        <h3 class="font-semibold text-base">{{ name || "Community Name" }}</h3>
        <p class="text-sm text-muted-foreground line-clamp-2 mt-1">
          {{ description || "Your description will appear here..." }}
        </p>
        <div class="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span class="flex items-center gap-1">
            <Users class="size-3" />
            0 members
          </span>
          <span class="flex items-center gap-1">
            <component :is="visibility === 'public' ? Globe : Lock" class="size-3" />
            {{ visibility === "public" ? "Public" : "Private" }}
          </span>
        </div>
        <div v-if="tags.length > 0" class="flex flex-wrap gap-1 mt-3">
          <Badge v-for="tag in tags" :key="tag" variant="secondary" class="text-xs">
            {{ tag }}
          </Badge>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Eye, Users, Globe, Lock } from "lucide-vue-next";

defineProps<{
  name: string;
  description: string;
  iconPreview: string | null;
  bannerPreview: string | null;
  visibility: "public" | "private";
  tags: string[];
}>();
</script>
