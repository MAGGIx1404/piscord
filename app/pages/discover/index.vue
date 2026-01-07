<template>
  <main class="w-full space-y-10 px-4 pb-10">
    <!-- Hero Section -->
    <DiscoverHero />

    <!-- Search and Filter Section -->
    <DiscoverSearch
      v-model:searchQuery="searchQuery"
      v-model:activeFilter="activeFilter"
      v-model:sortBy="sortBy"
      :filters="communityFilters"
      :sort-options="sortOptions"
      :results-count="filteredCommunities.length"
      @clear-filters="clearFilters"
    />

    <!-- Community list -->
    <div
      v-if="filteredCommunities.length"
      class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <DiscoverCommunityCard
        v-for="community in filteredCommunities"
        :key="community.id"
        :community="community"
      />
    </div>

    <!-- Empty State -->
    <DiscoverEmptyState v-else @reset="clearFilters" />
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

const searchQuery = ref("");
const activeFilter = ref("all");
const sortBy = ref("popular");

const communityFilters = [
  { value: "all", label: "All", icon: Sparkles, count: null },
  { value: "gaming", label: "Gaming", icon: Gamepad2, count: 12 },
  { value: "tech", label: "Tech", icon: Code, count: 8 },
  { value: "study", label: "Study", icon: BookOpen, count: 5 },
  { value: "art", label: "Art & Design", icon: Palette, count: 6 },
  { value: "music", label: "Music", icon: Music, count: 4 },
  { value: "fun", label: "Fun & Memes", icon: Users, count: 10 }
];

const sortOptions = [
  { value: "popular", label: "Most Popular", icon: TrendingUp },
  { value: "newest", label: "Newest", icon: Sparkles },
  { value: "members", label: "Most Members", icon: Users },
  { value: "name", label: "Name (A-Z)", icon: ArrowUpDown }
];

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
    type: "fun"
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
      // For demo, reverse the array
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
