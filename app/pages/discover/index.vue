<template>
  <main class="w-full space-y-10 pb-10 px-4">
    <div class="w-full relative overflow-hidden">
      <WidgetsImagePoster src="/images/servers/p-4.jpg" />
      <div class="max-w-3xl absolute bottom-0 left-0 p-10 text-white space-y-3">
        <h1 class="text-5xl font-bold">Discover Communities</h1>
        <p class="text-lg">
          Explore a variety of communities and join the ones that interest you. Connect, share, and
          grow with like-minded individuals.
        </p>
        <Button variant="secondary" as-child>
          <NuxtLink to="/community/create"> <BadgePlus /> Create Community </NuxtLink>
        </Button>
      </div>
    </div>

    <!-- Search and Filter Section -->
    <div class="w-full space-y-4">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 class="text-3xl font-medium">Featured Communities</h1>

        <!-- Search and Sort -->
        <div class="flex items-center gap-2 w-full md:w-auto">
          <!-- Search Input -->
          <div class="relative flex-1 md:w-80">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input v-model="searchQuery" placeholder="Search communities..." class="pl-10 pr-4" />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X class="size-4" />
            </button>
          </div>

          <!-- Sort Dropdown -->
          <DropdownMenu>
            <DropdownMenuTrigger asChild class="h-auto">
              <Button variant="outline" size="default" class="shrink-0">
                <ArrowUpDown class="size-4" />
                <span class="hidden sm:inline">{{
                  sortOptions.find((s) => s.value === sortBy)?.label
                }}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                v-for="option in sortOptions"
                :key="option.value"
                @click="sortBy = option.value"
                :class="{ 'bg-accent': sortBy === option.value }"
              >
                <component :is="option.icon" class="size-4" />
                {{ option.label }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex items-center gap-2 flex-wrap">
        <Button
          v-for="filter in communityFilters"
          :key="filter.value"
          :variant="activeFilter === filter.value ? 'default' : 'outline'"
          size="sm"
          @click="activeFilter = filter.value"
          class="gap-1.5"
        >
          <component :is="filter.icon" class="size-4" />
          {{ filter.label }}
          <Badge v-if="filter.count" variant="secondary" class="ml-1 text-xs px-1.5">
            {{ filter.count }}
          </Badge>
        </Button>
      </div>

      <!-- Active Filters & Results Count -->
      <div class="flex items-center">
        <p class="text-sm text-muted-foreground">
          Showing <span class="font-medium text-foreground">{{ filteredCommunities.length }}</span>
          {{ filteredCommunities.length === 1 ? "community" : "communities" }}
          <template v-if="activeFilter !== 'all' || searchQuery">
            <span class="mx-1">•</span>
            <button @click="clearFilters" class="text-primary hover:underline">
              Clear filters
            </button>
          </template>
        </p>
      </div>
    </div>

    <!-- Community list -->
    <div
      v-if="filteredCommunities.length"
      class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <WidgetsCommunityCard
        v-for="community in filteredCommunities"
        :key="community.id"
        :community="community"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="w-full flex flex-col items-center justify-center py-20 space-y-4">
      <div class="size-20 rounded-full bg-muted flex items-center justify-center">
        <SearchX class="size-10 text-muted-foreground" />
      </div>
      <div class="text-center space-y-2">
        <h3 class="text-lg font-semibold">No communities found</h3>
        <p class="text-sm text-muted-foreground max-w-md">
          We couldn't find any communities matching your search. Try adjusting your filters or
          search term.
        </p>
      </div>
      <Button variant="outline" @click="clearFilters">
        <RotateCcw class="size-4" />
        Reset filters
      </Button>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  BadgePlus,
  Search,
  X,
  ArrowUpDown,
  SearchX,
  RotateCcw,
  Sparkles,
  Gamepad2,
  Code,
  BookOpen,
  Palette,
  Music,
  Users,
  TrendingUp
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
