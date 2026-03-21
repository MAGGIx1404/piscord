<template>
  <main class="min-h-screen w-full">
    <!-- Header with Search -->
    <DiscoverHeader
      v-model:search-query="searchQuery"
      v-model:active-filter="activeFilter"
      :filters="communityFilters"
      :total-communities="total"
      :total-members="totalMembers"
      :online-now="onlineNow"
    />

    <!-- Main Content -->
    <div class="px-6 py-10">
      <!-- Loading skeleton (initial load) -->
      <div v-if="pending" class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="n in 9"
          :key="n"
          class="h-64 animate-pulse rounded-2xl border border-border/50 bg-card/30"
        />
      </div>

      <!-- Community Grid -->
      <template v-else-if="communities.length">
        <DiscoverCommunityGrid
          :communities="communities"
          :show-title="!searchQuery && activeFilter === 'all'"
          @join="handleJoin"
          @card-click="openCommunityModal"
        />

        <!-- Infinite scroll sentinel -->
        <div v-if="hasMore" ref="sentinelRef" class="mt-6 flex items-center justify-center py-4">
          <div v-if="loadingMore" class="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 class="size-4 animate-spin" />
            Loading more...
          </div>
        </div>

        <!-- End of list -->
        <p
          v-if="!hasMore && communities.length > perPage"
          class="mt-6 text-center text-xs text-muted-foreground"
        >
          You've reached the end
        </p>
      </template>

      <!-- Empty State -->
      <DiscoverEmptyState v-else @reset="clearFilters" />

      <!-- Create CTA -->
      <DiscoverCreateCTA />
    </div>

    <!-- Community Detail Modal -->
    <CommunityDetailModal
      v-model="modalOpen"
      :data="modalData"
      :loading="modalLoading"
      @navigate="goToCommunity"
    />
  </main>
</template>

<script setup lang="ts">
import {
  Sparkles as SparklesIcon,
  Gamepad2,
  Code,
  BookOpen,
  Palette,
  Music,
  Users as UsersIcon,
  Loader2
} from "lucide-vue-next";
import { useIntersectionObserver, watchDebounced } from "@vueuse/core";
import type { Community } from "~/components/discover/types";
import type { CommunityOverviewData } from "~/components/community/CommunityDetailModal.vue";
import { toast } from "vue-sonner";

const api = useApi();
const router = useRouter();
const searchQuery = ref("");
const activeFilter = ref("all");

const communityFilters = [
  { value: "all", label: "All", icon: SparklesIcon },
  { value: "gaming", label: "Gaming", icon: Gamepad2 },
  { value: "tech", label: "Tech", icon: Code },
  { value: "study", label: "Study", icon: BookOpen },
  { value: "art", label: "Art", icon: Palette },
  { value: "music", label: "Music", icon: Music },
  { value: "fun", label: "Fun", icon: UsersIcon }
];

// ─── Infinite scroll state ──────────────────────────────────────────────────

const perPage = 12;

interface ApiCommunity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  banner_url: string | null;
  category: string | null;
  member_count: number;
  require_approval: boolean;
  is_member: boolean;
  has_pending_request: boolean;
}

interface ApiResponse {
  communities: ApiCommunity[];
  total: number;
}

const rawCommunities = ref<ApiCommunity[]>([]);
const total = ref(0);
const offset = ref(0);
const pending = ref(true);
const loadingMore = ref(false);
const hasMore = computed(() => offset.value < total.value);

// Track communities where the current user has a pending approval request
const pendingRequestIds = ref<Set<string>>(new Set());

async function fetchCommunities(reset = false) {
  if (reset) {
    offset.value = 0;
    rawCommunities.value = [];
    pending.value = true;
  } else {
    loadingMore.value = true;
  }

  try {
    const query: Record<string, unknown> = {
      limit: perPage,
      offset: offset.value
    };
    if (searchQuery.value) query.search = searchQuery.value;
    if (activeFilter.value !== "all") query.category = activeFilter.value;

    const data = await api<ApiResponse>("/api/communities", { query });

    if (reset) {
      rawCommunities.value = data.communities;
      pendingRequestIds.value = new Set(
        data.communities.filter((c) => c.has_pending_request).map((c) => c.id)
      );
    } else {
      rawCommunities.value = [...rawCommunities.value, ...data.communities];
      for (const c of data.communities) {
        if (c.has_pending_request) pendingRequestIds.value.add(c.id);
      }
    }
    total.value = data.total;
    offset.value = offset.value + data.communities.length;
  } finally {
    pending.value = false;
    loadingMore.value = false;
  }
}

function loadMore() {
  if (!hasMore.value || loadingMore.value || pending.value) return;
  fetchCommunities(false);
}

// Map raw API data → Community type for DiscoverCard
const communities = computed<Community[]>(() =>
  rawCommunities.value.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    totalUsers: c.member_count,
    posterImage: c.banner_url,
    iconImage: c.icon_url,
    type: c.category,
    requiresApproval: c.require_approval,
    isMember: c.is_member,
    isPendingRequest: pendingRequestIds.value.has(c.id)
  }))
);

// Stats
const totalMembers = computed(() =>
  rawCommunities.value.reduce((sum, c) => sum + c.member_count, 0)
);
const onlineNow = computed(() => Math.floor(totalMembers.value * 0.08));

// Debounced search/filter reset
watchDebounced(
  [searchQuery, activeFilter],
  () => {
    fetchCommunities(true);
  },
  { debounce: 300 }
);

// Intersection observer for infinite scroll
const sentinelRef = ref<HTMLElement | null>(null);

useIntersectionObserver(sentinelRef, ([entry]) => {
  if (entry?.isIntersecting) {
    loadMore();
  }
});

// Initial fetch
onMounted(() => {
  fetchCommunities(true);
});

// ─── Community detail modal ─────────────────────────────────────────────────

const modalOpen = ref(false);
const modalData = ref<CommunityOverviewData | null>(null);
const modalLoading = ref(false);

async function openCommunityModal(id: string) {
  modalData.value = null;
  modalLoading.value = true;
  modalOpen.value = true;

  try {
    modalData.value = await api<CommunityOverviewData>(`/api/communities/${id}`);
  } catch {
    modalOpen.value = false;
  } finally {
    modalLoading.value = false;
  }
}

function goToCommunity(id: string) {
  modalOpen.value = false;
  const communityStore = useCommunityStore();
  communityStore.setCurrentCommunity(id);
  router.push(`/community/${id}`);
}

// ─── Join ──────────────────────────────────────────────────────────────────────

interface JoinResult {
  joined: boolean;
  pending: boolean;
  slug: string;
  member_count: number;
}

const handleJoin = async (communityId: string, _isRequest: boolean) => {
  try {
    const result = await api<JoinResult>(`/api/communities/${communityId}/join`, {
      method: "POST"
    });

    if (result.joined) {
      const communityStore = useCommunityStore();
      communityStore.setCurrentCommunity(communityId);
      await router.push(`/community/${communityId}?welcome=1`);
    } else if (result.pending) {
      pendingRequestIds.value = new Set([...pendingRequestIds.value, communityId]);
      toast.success("Join request sent! Waiting for admin approval.");
    } else {
      fetchCommunities(true);
    }
  } catch (err: any) {
    const status = err?.status ?? err?.statusCode;
    if (status === 409) {
      pendingRequestIds.value = new Set([...pendingRequestIds.value, communityId]);
      toast.info("You already have a pending request for this community.");
    } else {
      toast.error(err?.data?.message ?? "Failed to join community.");
    }
  }
};

const clearFilters = () => {
  searchQuery.value = "";
  activeFilter.value = "all";
};
</script>
