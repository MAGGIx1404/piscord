<template>
  <Card class="gap-4">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold flex items-center gap-2">
        <Activity class="size-4" />
        Recent Activity
      </h3>
      <Button variant="ghost" size="sm" class="h-7 text-xs" @click="$emit('viewAll')">
        View all
      </Button>
    </div>
    <div class="space-y-4">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="flex items-start gap-3 cursor-pointer"
        @click="$emit('select', activity)"
      >
        <Avatar class="size-7 mt-0.5">
          <AvatarImage :src="activity.user.avatar" />
          <AvatarFallback class="text-xs">{{ activity.user.initials }}</AvatarFallback>
        </Avatar>
        <div class="flex-1 min-w-0">
          <p class="text-sm">
            <span class="font-medium">{{ activity.user.name }}</span>
            <span class="text-muted-foreground"> {{ activity.action }}</span>
          </p>
          <p class="text-xs text-muted-foreground">{{ activity.time }}</p>
        </div>
        <component
          :is="activity.icon"
          v-if="activity.icon"
          class="size-4 text-muted-foreground mt-0.5"
        />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Activity } from "lucide-vue-next";
import type { Component } from "vue";

interface ActivityUser {
  name: string;
  avatar: string;
  initials: string;
}

interface ActivityItem {
  id: string | number;
  user: ActivityUser;
  action: string;
  time: string;
  icon?: Component;
}

interface Props {
  activities: ActivityItem[];
}

defineProps<Props>();

defineEmits<{
  viewAll: [];
  select: [activity: ActivityItem];
}>();
</script>
