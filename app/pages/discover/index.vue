<template>
  <main class="min-h-screen w-full">
    <!-- Header with Search -->
    <DiscoverHeader
      v-model:search-query="searchQuery"
      v-model:active-filter="activeFilter"
      :filters="communityFilters"
      :total-communities="totalCommunities"
      :total-members="totalMembers"
      :online-now="onlineNow"
    />

    <!-- Main Content -->
    <div class="px-6 py-10">
      <!-- Community Grid -->
      <DiscoverCommunityGrid
        v-if="!pending && filteredCommunities.length"
        :communities="filteredCommunities"
        :show-title="!searchQuery && activeFilter === 'all'"
        @join="handleJoin"
      />

      <!-- Loading skeleton -->
      <div v-else-if="pending" class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="n in 6"
          :key="n"
          class="h-64 animate-pulse rounded-2xl border border-border/50 bg-card/30"
        />
      </div>

      <!-- Empty State -->
      <DiscoverEmptyState v-else @reset="clearFilters" />

      <!-- Create CTA -->
      <DiscoverCreateCTA />
    </div>
  </main>
</template>

<script setup lang="ts">
import { Sparkles, Gamepad2, Code, BookOpen, Palette, Music, Users } from "lucide-vue-next";
import type { Community } from "~/components/discover/types";
import { toast } from "vue-sonner";

definePageMeta({
  layout: "entry"
});

const api = useApi();
const searchQuery = ref("");
const activeFilter = ref("all");

const communityFilters = [
  { value: "all", label: "All", icon: Sparkles },
  { value: "gaming", label: "Gaming", icon: Gamepad2 },
  { value: "tech", label: "Tech", icon: Code },
  { value: "study", label: "Study", icon: BookOpen },
  { value: "art", label: "Art", icon: Palette },
  { value: "music", label: "Music", icon: Music },
  { value: "fun", label: "Fun", icon: Users }
];

// ─── Fetch from API ────────────────────────────────────────────────────────────

interface ApiResponse {
  communities: {
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
  }[];
  total: number;
}

const fetchQuery = computed(() => ({
  search: searchQuery.value || undefined,
  category: activeFilter.value !== "all" ? activeFilter.value : undefined
}));

const { data, pending, refresh } = await useAsyncData<ApiResponse>(
  "discover-communities",
  () => api<ApiResponse>("/api/communities", { query: fetchQuery.value }),
  { watch: [fetchQuery] }
);

const communities = computed<Community[]>(() =>
  (data.value?.communities ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    totalUsers: c.member_count,
    posterImage: c.banner_url,
    iconImage: c.icon_url,
    type: c.category,
    requiresApproval: c.require_approval,
    isMember: c.is_member
  }))
);

const filteredCommunities = computed(() => communities.value);

// Stats
const totalCommunities = computed(() => data.value?.total ?? 0);
const totalMembers = computed(() =>
  (data.value?.communities ?? []).reduce((sum, c) => sum + c.member_count, 0)
);
const onlineNow = computed(() => Math.floor(totalMembers.value * 0.08));

// ─── Join ──────────────────────────────────────────────────────────────────────

const handleJoin = async (communityId: string, isRequest: boolean) => {
  try {
    await api(`/api/communities/${communityId}/join`, { method: "POST" });
    if (isRequest) {
      toast.success("Join request sent! Waiting for admin approval.");
    } else {
      toast.success("You joined the community!");
    }
    refresh();
  } catch (err: any) {
    toast.error(err?.data?.message ?? "Failed to join community.");
  }
};

const clearFilters = () => {
  searchQuery.value = "";
  activeFilter.value = "all";
};
</script>
