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
      <!-- Loading skeleton -->
      <div v-if="pending" class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="n in 6"
          :key="n"
          class="flex animate-pulse items-center gap-4 rounded-2xl border border-border/50 bg-card/30 p-4"
        >
          <div class="size-12 shrink-0 rounded-xl bg-muted/50" />
          <div class="flex-1 space-y-2">
            <div class="h-4 w-1/2 rounded bg-muted/50" />
            <div class="h-3 w-1/3 rounded bg-muted/40" />
          </div>
        </div>
      </div>

      <!-- Grid -->
      <div
        v-else-if="communities.length"
        class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        <button
          v-for="c in communities"
          :key="c.id"
          class="group relative flex items-center gap-4 rounded-2xl border border-border/50 bg-card/50 p-4 text-left transition-all duration-200 hover:border-border hover:bg-card hover:shadow-md"
          :class="c.id === currentCommunityId ? 'ring-2 ring-primary/40' : ''"
          @click="goToCommunity(c.id)"
        >
          <!-- Active indicator -->
          <div
            v-if="c.id === currentCommunityId"
            class="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5"
          >
            <div class="size-1.5 rounded-full bg-primary" />
            <span class="text-[10px] font-medium text-primary">Active</span>
          </div>

          <!-- Icon -->
          <Avatar class="size-12 shrink-0 rounded-xl">
            <AvatarImage :src="c.icon_url ?? ''" />
            <AvatarFallback class="rounded-xl text-sm font-semibold">
              {{ c.name.charAt(0).toUpperCase() }}
            </AvatarFallback>
          </Avatar>

          <!-- Info -->
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold">{{ c.name }}</p>
            <div class="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span class="flex items-center gap-1">
                <Users class="size-3" />
                {{ formatCount(c.member_count) }}
              </span>
              <span v-if="c.is_owner" class="flex items-center gap-1 text-amber-500">
                <Crown class="size-3" />
                Owner
              </span>
            </div>
          </div>

          <!-- Arrow -->
          <ChevronRight
            class="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
          />
        </button>
      </div>

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

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" :disabled="page <= 1" @click="page--">
          Previous
        </Button>
        <span class="px-3 text-sm text-muted-foreground">
          Page {{ page }} of {{ totalPages }}
        </span>
        <Button variant="outline" size="sm" :disabled="page >= totalPages" @click="page++">
          Next
        </Button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { Search, X, Users, Crown, ChevronRight, Building2 } from "lucide-vue-next";

const api = useApi();
const router = useRouter();
const communityStore = useCommunityStore();
const currentCommunityId = computed(() => communityStore.currentCommunityId);

const searchQuery = ref("");
const page = ref(1);
const perPage = 18;

// Reset to page 1 when search changes
watch(searchQuery, () => {
  page.value = 1;
});

const fetchQuery = computed(() => ({
  search: searchQuery.value || undefined,
  limit: perPage,
  offset: (page.value - 1) * perPage
}));

interface ApiResponse {
  communities: {
    id: string;
    name: string;
    slug: string;
    icon_url: string | null;
    member_count: number;
    is_public: boolean;
    is_owner: boolean;
    joined_at: string;
  }[];
  total: number;
  limit: number;
  offset: number;
}

const { data, pending } = await useAsyncData<ApiResponse>(
  "my-communities",
  () => api<ApiResponse>("/api/users/me/communities", { query: fetchQuery.value }),
  { watch: [fetchQuery] }
);

const communities = computed(() => data.value?.communities ?? []);
const total = computed(() => data.value?.total ?? 0);
const totalPages = computed(() => Math.ceil(total.value / perPage));

function goToCommunity(id: string) {
  communityStore.setCurrentCommunity(id);
  router.push(`/community/${id}`);
}

function formatCount(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}
</script>
