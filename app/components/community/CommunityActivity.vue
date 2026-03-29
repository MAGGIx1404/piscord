<template>
  <div class="overflow-hidden rounded-2xl border border-border/50 bg-card/30">
    <!-- Header with tabs -->
    <div class="flex items-center justify-between border-b border-border/50 px-5 py-4">
      <div class="flex items-center gap-2">
        <div class="flex size-7 items-center justify-center rounded-lg bg-primary/10">
          <Activity class="size-3.5 text-primary" />
        </div>
        <h3 class="text-sm font-semibold">Community Activity</h3>
      </div>

      <!-- Tab switcher -->
      <div class="flex items-center gap-1 rounded-lg bg-muted/40 p-0.5">
        <button
          class="rounded-md px-3 py-1 text-xs font-medium transition-colors"
          :class="
            activeTab === 'activity'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="activeTab = 'activity'"
        >
          Activity
        </button>
        <button
          v-if="isOwner && requireApproval"
          class="relative rounded-md px-3 py-1 text-xs font-medium transition-colors"
          :class="
            activeTab === 'requests'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="activeTab = 'requests'"
        >
          Requests
          <span
            v-if="pendingCount > 0"
            class="ml-1.5 inline-flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-semibold text-white"
          >
            {{ pendingCount > 9 ? "9+" : pendingCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex flex-col gap-3 p-5">
      <div v-for="n in 4" :key="n" class="flex items-center gap-3">
        <div class="size-8 animate-pulse rounded-full bg-muted/50" />
        <div class="flex-1 space-y-1.5">
          <div class="h-3 w-1/3 animate-pulse rounded bg-muted/50" />
          <div class="h-2.5 w-1/2 animate-pulse rounded bg-muted/40" />
        </div>
      </div>
    </div>

    <template v-else>
      <div v-if="activeTab === 'activity'">
        <div
          v-if="!recentActivity.length"
          class="flex flex-col items-center gap-2 px-5 py-10 text-center"
        >
          <div class="flex size-10 items-center justify-center rounded-xl bg-muted/40">
            <Activity class="size-4.5 text-muted-foreground" />
          </div>
          <p class="text-sm font-medium">No activity yet</p>
          <p class="text-xs text-muted-foreground">Member joins will show up here.</p>
        </div>

        <div v-else class="divide-y divide-border/40">
          <div
            v-for="item in recentActivity"
            :key="item.id"
            class="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/10"
          >
            <Avatar class="size-8 shrink-0">
              <AvatarImage :src="item.avatar_url ?? ''" />
              <AvatarFallback class="text-xs">
                {{ item.username.slice(0, 2).toUpperCase() }}
              </AvatarFallback>
            </Avatar>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm">
                <span class="font-medium">{{ item.username }}</span>
                <span class="text-muted-foreground"> joined the community</span>
              </p>
              <p class="text-[11px] text-muted-foreground/60">
                {{ formatDate(item.joined_at) }}
              </p>
            </div>
            <div
              class="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10"
            >
              <UserPlus class="size-3 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'requests' && isOwner">
        <div
          v-if="!joinRequests.length"
          class="flex flex-col items-center gap-2 px-5 py-10 text-center"
        >
          <div class="flex size-10 items-center justify-center rounded-xl bg-muted/40">
            <ClipboardList class="size-4.5 text-muted-foreground" />
          </div>
          <p class="text-sm font-medium">No pending requests</p>
          <p class="text-xs text-muted-foreground">
            New join requests will appear here for review.
          </p>
        </div>

        <div v-else class="divide-y divide-border/40">
          <div
            v-for="req in joinRequests"
            :key="req.id"
            class="px-5 py-3.5 transition-colors hover:bg-muted/10"
          >
            <div class="flex items-start gap-3">
              <Avatar class="mt-0.5 size-8 shrink-0">
                <AvatarImage :src="req.avatar_url ?? ''" />
                <AvatarFallback class="text-xs">
                  {{ req.username.slice(0, 2).toUpperCase() }}
                </AvatarFallback>
              </Avatar>

              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <p class="truncate text-sm font-medium">{{ req.username }}</p>
                  <p class="shrink-0 text-[11px] text-muted-foreground/60">
                    {{ formatDate(req.created_at) }}
                  </p>
                </div>

                <p v-if="req.note" class="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  "{{ req.note }}"
                </p>
                <p v-else class="mt-0.5 text-xs text-muted-foreground/50 italic">
                  No message attached
                </p>

                <!-- Action buttons -->
                <div class="mt-2.5 flex items-center gap-2">
                  <Button
                    size="sm"
                    class="h-7 gap-1.5 bg-emerald-500 px-3 text-xs font-medium text-white hover:bg-emerald-600"
                    :disabled="reviewing === req.id"
                    @click="reviewRequest(req.id, 'approve')"
                  >
                    <Loader2
                      v-if="reviewing === req.id && reviewAction === 'approve'"
                      class="size-3 animate-spin"
                    />
                    <Check v-else class="size-3" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    class="h-7 gap-1.5 border-red-500/40 px-3 text-xs font-medium text-red-500 hover:bg-red-500/10"
                    :disabled="reviewing === req.id"
                    @click="reviewRequest(req.id, 'reject')"
                  >
                    <Loader2
                      v-if="reviewing === req.id && reviewAction === 'reject'"
                      class="size-3 animate-spin"
                    />
                    <X v-else class="size-3" />
                    Decline
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Footer: refresh hint -->
    <div
      v-if="!pending && (recentActivity.length || joinRequests.length)"
      class="flex items-center justify-between border-t border-border/40 bg-muted/10 px-5 py-2.5"
    >
      <p class="text-[11px] text-muted-foreground/50">
        {{
          activeTab === "activity"
            ? `${recentActivity.length} recent events`
            : `${joinRequests.length} pending`
        }}
      </p>
      <button
        class="flex items-center gap-1 text-[11px] text-muted-foreground/60 transition-colors hover:text-foreground"
        @click="handleRefresh"
      >
        <RefreshCw class="size-2.5" />
        Refresh
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Activity, UserPlus, ClipboardList, Check, X, Loader2, RefreshCw } from "lucide-vue-next";
import { toast } from "vue-sonner";
import type { LiveActivityItem, LiveJoinRequest } from "~/composables/useCommunityLive";

const props = defineProps<{
  communityId: string;
}>();

const emit = defineEmits<{
  memberCountUpdate: [count: number];
  memberJoin: [member: LiveActivityItem];
}>();

const api = useApi();
const activeTab = ref<"activity" | "requests">("activity");
const reviewing = ref<string | null>(null);
const reviewAction = ref<"approve" | "reject" | null>(null);

interface ActivityItem {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  joined_at: string;
}

interface JoinRequestItem {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  note: string | null;
  created_at: string;
  status: string;
}

interface ApiResponse {
  recentActivity: ActivityItem[];
  joinRequests: JoinRequestItem[];
  isOwner: boolean;
  requireApproval: boolean;
}

const { data, pending, refresh } = await useAsyncData<ApiResponse>(
  `community-activity-${props.communityId}`,
  () => api<ApiResponse>(`/api/communities/${props.communityId}/activity`)
);

const recentActivity = computed(() => data.value?.recentActivity ?? []);
const joinRequests = computed(() => data.value?.joinRequests ?? []);
const isOwner = computed(() => data.value?.isOwner ?? false);
const requireApproval = computed(() => data.value?.requireApproval ?? false);
const pendingCount = computed(() => joinRequests.value.length);

// Auto-switch to requests tab if owner has pending items and no tab chosen yet
watch(data, (val) => {
  if (val?.isOwner && val?.joinRequests?.length && activeTab.value === "activity") {
    // Don't auto-switch — let the badge draw attention instead
  }
});

const { connected, connect } = useCommunityLive(
  computed(() => props.communityId),
  {
    onJoinRequest(request: LiveJoinRequest) {
      if (!data.value) return;
      data.value.joinRequests = [request as JoinRequestItem, ...data.value.joinRequests];
    },

    onMemberJoin(member: LiveActivityItem, memberCount: number) {
      if (!data.value) return;
      data.value.recentActivity = [member as ActivityItem, ...data.value.recentActivity].slice(
        0,
        10
      );
      emit("memberCountUpdate", memberCount);
      emit("memberJoin", member);
    },

    onRequestReviewed(requestId: string, _status: string, _userId: string, memberCount: number) {
      if (!data.value) return;
      data.value.joinRequests = data.value.joinRequests.filter((r) => r.id !== requestId);
      emit("memberCountUpdate", memberCount);
    }
  }
);

watch(
  data,
  (val) => {
    if (val && !connected.value) connect();
  },
  { immediate: true }
);

async function reviewRequest(requestId: string, action: "approve" | "reject") {
  reviewing.value = requestId;
  reviewAction.value = action;
  try {
    await api(`/api/communities/${props.communityId}/join-requests/${requestId}`, {
      method: "PATCH",
      body: { action }
    });
    toast.success(
      action === "approve" ? "Request approved — user added as member." : "Request declined."
    );
    // WS will update the list in real-time; refresh as fallback
    if (!connected.value) await refresh();
  } catch (err: any) {
    toast.error(err?.data?.message ?? "Failed to process request.");
  } finally {
    reviewing.value = null;
    reviewAction.value = null;
  }
}

function handleRefresh() {
  void refresh();
}

function formatDate(iso: string) {
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
}
</script>
