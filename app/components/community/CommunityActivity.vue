<template>
  <Card>
    <h3 class="font-semibold flex items-center gap-2">
      <Clock class="size-4" />
      Recent Activity
    </h3>
    <div class="space-y-1">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
        @click="$emit('select', activity)"
      >
        <Avatar class="size-10 shrink-0">
          <AvatarImage :src="activity.userAvatar" />
          <AvatarFallback>{{ activity.userName.charAt(0) }}</AvatarFallback>
        </Avatar>
        <div class="flex-1 min-w-0">
          <p class="text-sm">
            <span class="font-medium">{{ activity.userName }}</span>
            <span class="text-muted-foreground"> {{ activity.action }}</span>
          </p>
          <p class="text-xs text-muted-foreground">{{ activity.time }}</p>
        </div>
        <ChevronRight
          class="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity self-center"
        />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Clock, ChevronRight } from "lucide-vue-next";

interface Activity {
  id: number | string;
  userName: string;
  userAvatar: string;
  action: string;
  time: string;
}

interface Props {
  activities: Activity[];
}

defineProps<Props>();

defineEmits<{
  select: [activity: Activity];
}>();
</script>
