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

    <h1 class="text-3xl font-medium">Featured Communities</h1>

    <!-- Community list -->
    <div class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <WidgetsCommunityCard
        v-for="community in communities"
        :key="community.id"
        :community="community"
      />
      <WidgetsCommunityCard
        v-for="community in communities"
        :key="community.id"
        :community="community"
      />
      <WidgetsCommunityCard
        v-for="community in communities"
        :key="community.id"
        :community="community"
      />
    </div>
  </main>
</template>

<script setup>
import { BadgePlus } from "lucide-vue-next";

const communities = ref([
  {
    id: "c1",
    name: "Pixel Raiders",
    description: "A fun place for gamers who love competition and teamwork.",
    totalUsers: 18420,
    posterImage: "/images/servers/p-1.jpg",
    iconImage: "https://api.dicebear.com/7.x/bottts/png?seed=PixelRaiders",
    type: "gaming"
  },
  {
    id: "c2",
    name: "Tech Toon Hub",
    description: "Technology discussions with a playful twist.",
    totalUsers: 25680,
    posterImage: "/images/servers/p-2.jpg",
    iconImage: "https://api.dicebear.com/7.x/adventurer/png?seed=TechToon",
    type: "tech"
  },
  {
    id: "c3",
    name: "Study Squad",
    description: "Study together, stay motivated, and grow smarter.",
    totalUsers: 14230,
    posterImage: "/images/servers/p-3.jpg",
    iconImage: "https://api.dicebear.com/7.x/fun-emoji/png?seed=StudySquad",
    type: "study"
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
    type: "tech"
  }
]);
</script>
