<template>
  <main class="min-h-screen w-full">
    <!-- Header -->
    <div class="sticky top-0 z-30 border-b border-border bg-background">
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
      <!-- Loading skeleton -->
      <div v-if="pending" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="n in 9"
          :key="n"
          class="h-16 animate-pulse rounded-xl border border-border/50 bg-card/30"
        />
      </div>

      <!-- List -->
      <template v-else-if="communities.length">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="c in communities"
            :key="c.id"
            :to="`/community/${c.slug || c.id}`"
            class="group flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 p-3 transition-colors hover:border-border hover:bg-card"
            @click="communityStore.setCurrentCommunity(c.id)"
          >
            <!-- Icon -->
            <Avatar class="size-10 shrink-0 rounded-lg">
              <AvatarImage v-if="c.icon_url" :src="c.icon_url" :alt="c.name" />
              <AvatarFallback class="rounded-lg bg-muted text-sm font-medium">
                {{ c.name.slice(0, 2).toUpperCase() }}
              </AvatarFallback>
            </Avatar>

            <!-- Info -->
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">{{ c.name }}</p>
              <p class="text-xs text-muted-foreground">
                {{ c.member_count.toLocaleString() }} member{{ c.member_count !== 1 ? "s" : "" }}
              </p>
            </div>

            <!-- Arrow -->
            <ChevronRight
              class="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            />
          </NuxtLink>
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
  </main>
</template>

<script setup lang="ts">
import { Search, X, Building2, Loader2, ChevronRight } from "lucide-vue-next";
import { useIntersectionObserver, watchDebounced } from "@vueuse/core";

const communityStore = useCommunityStore();

// ─── Infinite scroll state ──────────────────────────────────────────────────

const searchQuery = ref("");
const perPage = 20;

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

const communities = ref<ApiCommunity[]>([]);
const total = ref(0);
const offset = ref(0);
const pending = ref(true);
const loadingMore = ref(false);
const hasMore = computed(() => offset.value < total.value);

const api = useApi();

async function fetchCommunities(reset = false) {
  if (reset) {
    offset.value = 0;
    communities.value = [];
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
      communities.value = data.communities;
    } else {
      communities.value = [...communities.value, ...data.communities];
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
</script>
