<template>
  <div class="p-5 rounded-2xl bg-card/50 border border-border/50 space-y-4">
    <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">About</h3>
    <div class="space-y-3">
      <div class="flex items-center gap-3 text-sm">
        <Calendar class="size-4 text-muted-foreground/60" />
        <span>Created {{ createdAt }}</span>
      </div>
      <div class="flex items-center gap-3 text-sm">
        <Globe class="size-4 text-muted-foreground/60" />
        <span>{{ visibility }}</span>
      </div>
      <div v-if="website" class="flex items-center gap-3 text-sm">
        <LinkIcon class="size-4 text-muted-foreground/60" />
        <a :href="website" target="_blank" class="text-primary hover:underline">
          {{ websiteDisplay }}
        </a>
      </div>
    </div>
    <div v-if="tags?.length" class="flex flex-wrap gap-1.5 pt-2">
      <Badge
        v-for="tag in tags.slice(0, 4)"
        :key="tag"
        variant="secondary"
        class="text-xs rounded-full"
      >
        {{ tag }}
      </Badge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Calendar, Globe, LinkIcon } from "lucide-vue-next";
import { computed } from "vue";

interface Props {
  createdAt: string;
  visibility?: string;
  website?: string;
  tags?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  visibility: "Public Community",
  tags: () => []
});

const websiteDisplay = computed(() => {
  if (!props.website) return "";
  return props.website.replace(/^https?:\/\//, "").replace(/\/$/, "");
});
</script>
