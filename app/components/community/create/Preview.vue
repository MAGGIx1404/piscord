<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Eye class="size-5" />
        Preview
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="border rounded-xl overflow-hidden">
        <!-- Preview Banner -->
        <WidgetsImagePoster
          v-if="bannerPreview"
          :src="bannerPreview"
          class="w-full h-20 object-cover"
          size="md"
        />
        <div
          v-else
          class="w-full h-40 bg-linear-to-r from-primary/30 via-purple-500/30 to-pink-500/30"
        />
        <!-- Preview Content -->
        <div class="p-4 -mt-8">
          <div class="size-16 rounded-xl bg-card border-4 border-card overflow-hidden relative z-3">
            <img v-if="iconPreview" :src="iconPreview" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-muted flex items-center justify-center">
              <Users class="size-6 text-muted-foreground" />
            </div>
          </div>
          <h3 class="font-semibold mt-2">{{ name || "Community Name" }}</h3>
          <p class="text-sm text-muted-foreground line-clamp-2 mt-1">
            {{ description || "Your community description will appear here..." }}
          </p>
          <div class="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
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
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Eye, Users, Globe, Lock } from "lucide-vue-next";

interface Props {
  name: string;
  description: string;
  visibility: "public" | "private";
  tags: string[];
  iconPreview?: string | null;
  bannerPreview?: string | null;
}

withDefaults(defineProps<Props>(), {
  iconPreview: null,
  bannerPreview: null
});
</script>
