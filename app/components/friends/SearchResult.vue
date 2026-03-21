<template>
  <div class="flex items-center gap-3 rounded-xl px-3 py-2.5">
    <Avatar class="size-10 shrink-0 rounded-full">
      <AvatarImage :src="user.avatar_url ?? ''" />
      <AvatarFallback class="text-sm font-semibold">
        {{ user.username.charAt(0).toUpperCase() }}
      </AvatarFallback>
    </Avatar>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium">{{ user.username }}</p>
    </div>
    <div class="shrink-0">
      <Badge v-if="user.friendship_status === 'accepted'" variant="secondary" class="text-xs">
        Friends
      </Badge>
      <Badge v-else-if="user.friendship_status === 'pending'" variant="outline" class="text-xs">
        {{ user.is_incoming ? "Respond" : "Pending" }}
      </Badge>
      <Button v-else size="sm" class="h-8 gap-1 text-xs" @click="$emit('addFriend', user.id)">
        <UserPlus class="size-3.5" />
        Add Friend
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserPlus } from "lucide-vue-next";
import type { UserSearchResult } from "~/composables/useFriends";

defineProps<{
  user: UserSearchResult;
}>();

defineEmits<{
  addFriend: [userId: string];
}>();
</script>
