<template>
  <div v-if="communities.length">
    <div class="flex items-center gap-2 mb-4" v-if="showTitle">
      <Compass class="size-5 text-primary" />
      <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        All Communities
      </h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <DiscoverCard v-for="community in communities" :key="community.id" :community="community" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Compass } from "lucide-vue-next";
import type { Community } from "./types";

interface Props {
  communities: Community[];
  showTitle?: boolean;
}

withDefaults(defineProps<Props>(), {
  showTitle: true
});
</script>
