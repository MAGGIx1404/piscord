<template>
  <main class="w-full min-h-screen">
    <!-- Header with Search -->
    <DiscoverHeader
      v-model:search-query="searchQuery"
      v-model:active-filter="activeFilter"
      v-model:sort-by="sortBy"
      :filters="communityFilters"
      :sort-options="sortOptions"
      :total-communities="totalCommunities"
      :total-members="totalMembers"
      :online-now="onlineNow"
    />

    <!-- Main Content -->
    <div class="px-6 py-10">
      <!-- Community Grid -->
      <DiscoverCommunityGrid
        v-if="filteredCommunities.length"
        :communities="filteredCommunities"
        :show-title="!searchQuery && activeFilter === 'all'"
      />

      <!-- Empty State -->
      <DiscoverEmptyState v-else @reset="clearFilters" />

      <!-- Create CTA -->
      <DiscoverCreateCTA />
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  Sparkles,
  Gamepad2,
  Code,
  BookOpen,
  Palette,
  Music,
  Users,
  TrendingUp,
  ArrowUpDown
} from "lucide-vue-next";

definePageMeta({
  layout: "entry"
});

const searchQuery = ref("");
const activeFilter = ref("all");
const sortBy = ref("popular");

const communityFilters = [
  { value: "all", label: "All", icon: Sparkles },
  { value: "gaming", label: "Gaming", icon: Gamepad2 },
  { value: "tech", label: "Tech", icon: Code },
  { value: "study", label: "Study", icon: BookOpen },
  { value: "art", label: "Art", icon: Palette },
  { value: "music", label: "Music", icon: Music },
  { value: "fun", label: "Fun", icon: Users }
];

const sortOptions = [
  { value: "popular", label: "Most Popular", icon: TrendingUp },
  { value: "newest", label: "Newest", icon: Sparkles },
  { value: "members", label: "Most Members", icon: Users },
  { value: "name", label: "Name (A-Z)", icon: ArrowUpDown }
];

const currentSortLabel = computed(() => {
  return sortOptions.find((opt) => opt.value === sortBy.value)?.label || "Sort";
});

const communities = ref([
  {
    id: "c1",
    name: "Pixel Raiders",
    description: "A fun place for gamers who love competition and teamwork.",
    totalUsers: 18420,
    posterImage: "/images/servers/p-1.jpg",
    iconImage: "https://api.dicebear.com/7.x/bottts/png?seed=PixelRaiders",
    type: "gaming",
    requiresApproval: false
  },
  {
    id: "c2",
    name: "Tech Toon Hub",
    description: "Technology discussions with a playful twist.",
    totalUsers: 25680,
    posterImage: "/images/servers/p-2.jpg",
    iconImage: "https://api.dicebear.com/7.x/adventurer/png?seed=TechToon",
    type: "tech",
    requiresApproval: true
  },
  {
    id: "c3",
    name: "Study Squad",
    description: "Study together, stay motivated, and grow smarter.",
    totalUsers: 14230,
    posterImage: "/images/servers/p-3.jpg",
    iconImage: "https://api.dicebear.com/7.x/fun-emoji/png?seed=StudySquad",
    type: "study",
    requiresApproval: false
  },
  {
    id: "c4",
    name: "Meme Town",
    description: "Memes, jokes, and unlimited fun.",
    totalUsers: 39210,
    posterImage: "/images/servers/p-4.jpg",
    iconImage: "https://api.dicebear.com/7.x/thumbs/png?seed=MemeTown",
    type: "fun",
    requiresApproval: false
  },
  {
    id: "c5",
    name: "Code Cartoons",
    description: "Coding concepts explained in a fun and simple way.",
    totalUsers: 22150,
    posterImage: "/images/servers/p-5.jpg",
    iconImage: "https://api.dicebear.com/7.x/bottts/png?seed=CodeCartoon",
    type: "tech",
    requiresApproval: true
  },
  {
    id: "c6",
    name: "Digital Artists",
    description: "Share your art, get feedback, and improve together.",
    totalUsers: 15890,
    posterImage: "/images/servers/p-1.jpg",
    iconImage: "https://api.dicebear.com/7.x/shapes/png?seed=DigitalArt",
    type: "art",
    requiresApproval: false
  },
  {
    id: "c7",
    name: "Beat Makers",
    description: "Music production, beats, and audio engineering community.",
    totalUsers: 9450,
    posterImage: "/images/servers/p-2.jpg",
    iconImage: "https://api.dicebear.com/7.x/identicon/png?seed=BeatMakers",
    type: "music",
    requiresApproval: true
  },
  {
    id: "c8",
    name: "Esports Arena",
    description: "Competitive gaming tournaments and team building.",
    totalUsers: 31200,
    posterImage: "/images/servers/p-3.jpg",
    iconImage: "https://api.dicebear.com/7.x/bottts/png?seed=EsportsArena",
    type: "gaming",
    requiresApproval: false
  }
]);

// Stats
const totalCommunities = computed(() => communities.value.length);
const totalMembers = computed(() => communities.value.reduce((sum, c) => sum + c.totalUsers, 0));
const onlineNow = computed(() => Math.floor(totalMembers.value * 0.08));

const filteredCommunities = computed(() => {
  let result = [...communities.value];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (c) => c.name.toLowerCase().includes(query) || c.description.toLowerCase().includes(query)
    );
  }

  // Apply type filter
  if (activeFilter.value !== "all") {
    result = result.filter((c) => c.type === activeFilter.value);
  }

  // Apply sorting
  switch (sortBy.value) {
    case "popular":
    case "members":
      result.sort((a, b) => b.totalUsers - a.totalUsers);
      break;
    case "name":
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "newest":
      result.reverse();
      break;
  }

  return result;
});

const clearFilters = () => {
  searchQuery.value = "";
  activeFilter.value = "all";
};
</script>
