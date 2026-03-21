<template>
  <div
    class="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-accent/50"
    :class="active ? 'bg-accent' : ''"
    @click="$emit('select', friend)"
  >
    <div class="relative shrink-0">
      <Avatar class="size-10 rounded-full">
        <AvatarImage :src="friend.avatar_url ?? ''" />
        <AvatarFallback class="text-sm font-semibold">
          {{ friend.username.charAt(0).toUpperCase() }}
        </AvatarFallback>
      </Avatar>
      <span
        class="absolute right-0 bottom-0 size-3 rounded-full ring-2 ring-background"
        :class="friend.is_online ? 'bg-green-500' : 'bg-muted-foreground/40'"
      />
    </div>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium">{{ friend.username }}</p>
      <p class="text-xs text-muted-foreground">
        {{ friend.is_online ? "Online" : "Offline" }}
      </p>
    </div>
    <Button
      variant="ghost"
      class="opacity-0 group-hover:opacity-100"
      @click.stop="$emit('remove', friend.id)"
    >
      <UserMinus class="size-4" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { UserMinus } from "lucide-vue-next";
import type { Friend } from "~/composables/useFriends";

defineProps<{
  friend: Friend;
  active?: boolean;
}>();

defineEmits<{
  select: [friend: Friend];
  remove: [friendId: string];
}>();
</script>
