<template>
  <div v-if="communities.length">
    <div class="mb-4 flex items-center gap-2" v-if="showTitle">
      <Compass class="size-5 text-primary" />
      <h2 class="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
        All Communities
      </h2>
    </div>

    <div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      <DiscoverCard
        v-for="community in communities"
        :key="community.id"
        :community="community"
        @join="(id, isRequest) => $emit('join', id, isRequest)"
      />
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

defineEmits<{ join: [id: string, isRequest: boolean] }>();
</script>
