<template>
  <main class="min-h-screen w-full">
    <!-- Header -->
    <div class="border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div class="px-6 py-8">
        <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold tracking-tight">My Communities</h1>
            <p class="mt-1 text-sm text-muted-foreground">
              <template v-if="!pending">
                {{ total }} communit{{ total === 1 ? "y" : "ies" }} joined
              </template>
              <template v-else>&nbsp;</template>
            </p>
          </div>

          <!-- Search -->
          <div class="relative w-full sm:max-w-xs">
            <Search
              class="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search communities..."
              class="h-10 w-full rounded-xl border border-border/50 bg-card/50 pr-9 pl-10 text-sm transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/30 focus:outline-none"
            />
            <button
              v-if="searchQuery"
              class="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              @click="searchQuery = ''"
            >
              <X class="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-6 py-8">
      <!-- Loading skeleton (initial load) -->
      <div v-if="pending" class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="n in 9"
          :key="n"
          class="h-64 animate-pulse rounded-2xl border border-border/50 bg-card/30"
        />
      </div>

      <!-- Grid -->
      <template v-else-if="communities.length">
        <div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <DiscoverCard
            v-for="c in communities"
            :key="c.id"
            :community="c"
            @join="handleJoin"
            @card-click="openCommunityModal"
          />
        </div>

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

      <!-- Empty state -->
      <div v-else class="flex flex-col items-center gap-3 py-20 text-center">
        <div class="flex size-14 items-center justify-center rounded-2xl bg-muted/40">
          <Building2 class="size-6 text-muted-foreground" />
        </div>
        <p class="text-sm font-medium">
          {{ searchQuery ? "No communities found" : "No communities yet" }}
        </p>
        <p class="max-w-xs text-xs text-muted-foreground">
          {{
            searchQuery
              ? "Try a different search term."
              : "Discover and join communities to get started."
          }}
        </p>
        <div class="mt-2 flex gap-2">
          <Button v-if="searchQuery" variant="outline" size="sm" @click="searchQuery = ''">
            Clear search
          </Button>
          <NuxtLink to="/discover">
            <Button size="sm"> Discover Communities </Button>
          </NuxtLink>
        </div>
      </div>
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
import { Search, X, Building2, Loader2 } from "lucide-vue-next";
import { useIntersectionObserver, watchDebounced } from "@vueuse/core";
import type { Community } from "~/components/discover/types";
import type { CommunityOverviewData } from "~/components/community/CommunityDetailModal.vue";

const api = useApi();
const router = useRouter();
const communityStore = useCommunityStore();

// ─── Infinite scroll state ──────────────────────────────────────────────────

const searchQuery = ref("");
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
  is_public: boolean;
  require_approval: boolean;
  is_owner: boolean;
  joined_at: string;
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

    const data = await api<ApiResponse>("/api/users/me/communities", { query });

    if (reset) {
      rawCommunities.value = data.communities;
    } else {
      rawCommunities.value = [...rawCommunities.value, ...data.communities];
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
    isMember: true
  }))
);

// Debounced search reset
watchDebounced(
  searchQuery,
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
    goToCommunity(id);
  } finally {
    modalLoading.value = false;
  }
}

function goToCommunity(id: string) {
  modalOpen.value = false;
  communityStore.setCurrentCommunity(id);
  router.push(`/community/${id}`);
}

// ─── Join handler (no-op for already-member cards, but needed for emit) ────

const handleJoin = (_communityId: string, _isRequest: boolean) => {
  // All communities on this page are already joined — this is a no-op
};
</script>
