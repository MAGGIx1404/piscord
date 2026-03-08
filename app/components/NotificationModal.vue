<template>
  <!-- Modal -->
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <!-- Custom trigger slot — receives { unreadCount, open } as props -->
      <slot name="trigger" :unread-count="unreadCount" :open="open">
        <!-- Default bell button -->
        <Button variant="ghost" size="icon" class="relative size-10 rounded-lg">
          <Bell class="size-4.5" />
          <span
            v-if="unreadCount > 0"
            class="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground"
          >
            {{ unreadCount > 9 ? "9+" : unreadCount }}
          </span>
        </Button>
      </slot>
    </DialogTrigger>

    <DialogContent class="flex max-h-[80vh] max-w-md flex-col gap-0 overflow-hidden p-0">
      <!-- Header -->
      <div class="flex items-start justify-between border-b border-border px-5 py-4 pr-10">
        <div class="flex items-center gap-2.5">
          <div class="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Bell class="size-4 text-primary" />
          </div>
          <div>
            <DialogTitle class="text-sm font-semibold">Notifications</DialogTitle>
            <p class="text-xs text-muted-foreground">Your community join requests</p>
          </div>
        </div>
        <Badge v-if="unreadCount > 0" variant="secondary" class="text-xs">
          {{ unreadCount }} actioned
        </Badge>
      </div>

      <!-- Body -->
      <ScrollArea class="flex-1 overflow-y-auto">
        <!-- Loading -->
        <div v-if="pending" class="flex flex-col gap-2 p-4">
          <div v-for="n in 4" :key="n" class="h-16 animate-pulse rounded-xl bg-muted/40" />
        </div>

        <!-- Empty -->
        <div
          v-else-if="!requests.length"
          class="flex flex-col items-center gap-3 px-6 py-14 text-center"
        >
          <div class="flex size-14 items-center justify-center rounded-2xl bg-muted/40">
            <BellOff class="size-6 text-muted-foreground" />
          </div>
          <p class="text-sm font-medium">No notifications yet</p>
          <p class="text-xs text-muted-foreground">
            Join requests you send will appear here with their status.
          </p>
        </div>

        <!-- List -->
        <div v-else class="divide-y divide-border/50">
          <div
            v-for="req in requests"
            :key="req.id"
            class="flex items-start gap-3.5 px-5 py-3.5 transition-colors hover:bg-muted/20"
          >
            <!-- Community Avatar -->
            <Avatar class="mt-0.5 size-9 shrink-0 rounded-lg">
              <AvatarImage :src="req.community_icon ?? ''" />
              <AvatarFallback class="rounded-lg text-sm">
                {{ req.community_name.charAt(0).toUpperCase() }}
              </AvatarFallback>
            </Avatar>

            <!-- Content -->
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <p class="truncate text-sm font-medium">{{ req.community_name }}</p>
                <StatusBadge :status="req.status" />
              </div>
              <p class="text-xs text-muted-foreground">
                {{ statusMessage(req.status) }}
              </p>
              <p class="text-[11px] text-muted-foreground/60">
                {{ formatDate(req.updated_at) }}
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>

      <!-- Footer -->
      <div
        v-if="requests.length"
        class="flex items-center justify-between border-t border-border bg-muted/20 px-5 py-3"
      >
        <p class="text-xs text-muted-foreground">
          {{ requests.length }} total request{{ requests.length !== 1 ? "s" : "" }}
        </p>
        <NuxtLink
          to="/discover"
          class="text-xs font-medium text-primary underline-offset-2 hover:underline"
          @click="open = false"
        >
          Explore communities
        </NuxtLink>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Bell, BellOff, CheckCircle2, Clock, MinusCircle, XCircle } from "lucide-vue-next";
import { Badge } from "#components";

const api = useApi();
const open = ref(false);

interface JoinRequest {
  id: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  community_id: string;
  community_name: string;
  community_slug: string;
  community_icon: string | null;
}

interface ApiResponse {
  requests: JoinRequest[];
  unreadCount: number;
}

const { data, pending, refresh } = await useAsyncData<ApiResponse>(
  "me-join-requests",
  () => api<ApiResponse>("/api/users/me/join-requests"),
  { server: false }
);

// Refresh on open; mark as notified on close
watch(open, async (val) => {
  if (val) {
    refresh();
  } else if (unreadCount.value > 0) {
    await api("/api/users/me/join-requests", { method: "PATCH" });
    refresh();
  }
});

const requests = computed(() => data.value?.requests ?? []);
const unreadCount = computed(() => data.value?.unreadCount ?? 0);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusMessage = (status: JoinRequest["status"]) => {
  switch (status) {
    case "pending":
      return "Your request is waiting for admin review.";
    case "approved":
      return "Your request was approved — welcome!";
    case "rejected":
      return "Your request was declined by the admins.";
    case "cancelled":
      return "You cancelled this request.";
  }
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ─── Status pill ──────────────────────────────────────────────────────────────

const StatusBadge = defineComponent({
  props: { status: { type: String, required: true } },
  setup(props) {
    const map: Record<string, { label: string; icon: any; cls: string }> = {
      pending: {
        label: "Pending",
        icon: Clock,
        cls: "border-amber-500/40 bg-amber-500/10 text-amber-500"
      },
      approved: {
        label: "Approved",
        icon: CheckCircle2,
        cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
      },
      rejected: {
        label: "Rejected",
        icon: XCircle,
        cls: "border-red-500/40 bg-red-500/10 text-red-500"
      },
      cancelled: {
        label: "Cancelled",
        icon: MinusCircle,
        cls: "border-muted-foreground/30 bg-muted/30 text-muted-foreground"
      }
    };
    return () => {
      const m = map[props.status] ?? map.pending;
      return h(
        Badge,
        {
          variant: "outline",
          class: `shrink-0 gap-1 px-1.5 py-0 text-[10px] font-medium ${m?.cls}`
        },
        () => [h(m?.icon, { class: "size-2.5" }), m?.label]
      );
    };
  }
});
</script>
