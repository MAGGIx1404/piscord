<template>
  <div class="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
    <Avatar class="size-10 shrink-0 rounded-full">
      <AvatarImage :src="request.avatar_url ?? ''" />
      <AvatarFallback class="text-sm font-semibold">
        {{ request.username.charAt(0).toUpperCase() }}
      </AvatarFallback>
    </Avatar>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium">{{ request.username }}</p>
      <p class="text-xs text-muted-foreground">{{ relativeDate(request.created_at) }}</p>
    </div>
    <div class="flex shrink-0 items-center gap-1.5">
      <template v-if="type === 'incoming'">
        <Button size="sm" class="h-8 gap-1 text-xs" @click="$emit('accept', request.id)">
          <Check class="size-3.5" />
          Accept
        </Button>
        <Button
          variant="outline"
          size="sm"
          class="h-8 gap-1 text-xs"
          @click="$emit('decline', request.id)"
        >
          <X class="size-3.5" />
        </Button>
      </template>
      <template v-else>
        <Button
          variant="outline"
          size="sm"
          class="h-8 gap-1 text-xs"
          @click="$emit('cancel', request.id)"
        >
          <X class="size-3.5" />
          Cancel
        </Button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, X } from "lucide-vue-next";
import type { FriendRequestUser } from "~/composables/useFriends";

defineProps<{
  request: FriendRequestUser;
  type: "incoming" | "outgoing";
}>();

defineEmits<{
  accept: [requestId: string];
  decline: [requestId: string];
  cancel: [requestId: string];
}>();

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
</script>
