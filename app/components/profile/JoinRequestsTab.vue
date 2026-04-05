<template>
  <div>
    <div v-if="pending" class="space-y-2">
      <div v-for="n in 4" :key="n" class="h-16 animate-pulse rounded-xl bg-muted/40" />
    </div>
    <div v-else-if="!requests.length" class="flex flex-col items-center gap-3 py-16 text-center">
      <div class="flex size-16 items-center justify-center rounded-2xl bg-muted/40">
        <Inbox class="size-7 text-muted-foreground" />
      </div>
      <p class="font-medium">No join requests</p>
      <p class="text-sm text-muted-foreground">
        Requests you send to private communities appear here.
      </p>
    </div>
    <div v-else class="space-y-2">
      <div
        v-for="req in requests"
        :key="req.id"
        class="flex items-center gap-3.5 rounded-xl border border-border/60 bg-card px-4 py-3"
      >
        <Avatar class="size-10 shrink-0 rounded-lg">
          <AvatarImage :src="req.community_icon ?? ''" />
          <AvatarFallback class="rounded-lg">{{ req.community_name.charAt(0) }}</AvatarFallback>
        </Avatar>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">{{ req.community_name }}</p>
          <p class="text-xs text-muted-foreground">{{ relativeDate(req.updated_at) }}</p>
        </div>
        <span
          class="shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize"
          :class="statusClass(req.status)"
        >
          {{ req.status }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Inbox } from "lucide-vue-next";

defineProps<{
  requests: {
    id: string;
    status: "pending" | "approved" | "rejected" | "cancelled";
    updated_at: string;
    community_name: string;
    community_icon: string | null;
  }[];
  pending: boolean;
}>();

function statusClass(status: string) {
  return (
    {
      pending: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
      approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      rejected: "border-red-500/40 bg-red-500/10 text-red-500",
      cancelled: "border-border bg-muted/40 text-muted-foreground"
    }[status] ?? "border-border bg-muted/40 text-muted-foreground"
  );
}
</script>
