<template>
  <main class="w-full space-y-10">
    <div class="w-full relative overflow-hidden">
      <WidgetsImagePoster src="/images/servers/poster.jpg" />
      <div class="max-w-3xl absolute bottom-0 left-0 p-10 text-white space-y-3">
        <h1 class="text-5xl font-bold">Discover Communities</h1>
        <p class="text-lg">
          Explore a variety of communities and join the ones that interest you. Connect, share, and
          grow with like-minded individuals.
        </p>
      </div>
    </div>

    <!-- Community list -->
    <div class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
      <Card
        v-for="community in communities"
        :key="community.id"
        class="relative p-0 overflow-hidden gap-0"
      >
        <div class="w-full -space-y-6">
          <WidgetsImagePoster :src="community.posterImage" :alt="community.name" size="md" />
        </div>

        <!-- Content -->
        <div class="pt-8 pb-4 px-4 space-y-3">
          <!-- Title row -->
          <div class="flex items-start justify-between gap-2">
            <h2 class="text-lg font-semibold truncate group-hover:text-primary transition-colors">
              {{ community.name }}
            </h2>
            <!-- Verified badge for large communities -->
            <Tooltip v-if="community.totalUsers > 20000">
              <TooltipTrigger>
                <div class="p-1 rounded-full bg-primary/10">
                  <BadgeCheck class="size-4 text-primary" />
                </div>
              </TooltipTrigger>
              <TooltipContent>Verified Community</TooltipContent>
            </Tooltip>
          </div>

          <!-- Description -->
          <p class="text-sm text-muted-foreground line-clamp-2 min-h-10">
            {{ community.description }}
          </p>

          <!-- Category badge -->
          <!-- <Badge class="backdrop-blur-md" :class="getCategoryBadgeClass(community.type)">
            <component :is="getCategoryIcon(community.type)" class="size-3" />
            {{ community.type }}
          </Badge> -->

          <!-- Stats row -->
          <!-- <div class="flex items-center gap-4 text-xs text-muted-foreground">
            <div class="flex items-center gap-1.5">
              <Users class="size-3.5" />
              <span class="font-medium">{{ formatNumber(community.totalUsers) }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="size-2 rounded-full bg-green-500 animate-pulse" />
              <span>{{ formatNumber(getOnlineCount(community.totalUsers)) }} online</span>
            </div>
          </div> -->

          <!-- Member avatars preview -->
          <div class="flex items-center justify-between pt-2">
            <div class="flex -space-x-2">
              <Avatar
                v-for="i in 5"
                :key="i"
                class="size-7 border-2 border-card ring-0 transition-transform hover:scale-110 hover:z-10"
              >
                <AvatarImage :src="`/images/avatar/${i}.png`" />
              </Avatar>
              <div
                class="size-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium border-2 border-card"
              >
                +{{ Math.floor(community.totalUsers / 1000) }}k
              </div>
            </div>

            <!-- Join button -->
            <Button
              size="sm"
              class="opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
              :class="joinedCommunities.has(community.id) ? 'bg-green-600 hover:bg-green-700' : ''"
              @click.stop="toggleJoin(community.id)"
            >
              <template v-if="joinedCommunities.has(community.id)">
                <Check class="size-4 mr-1" />
                Joined
              </template>
              <template v-else>
                <Plus class="size-4 mr-1" />
                Join
              </template>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  </main>
</template>

<script setup>
import {
  Users,
  Plus,
  Check,
  BadgeCheck,
  Gamepad2,
  Code2,
  BookOpen,
  Smile,
  Briefcase,
  Palette,
  MessageCircle,
  Coins
} from "lucide-vue-next";

const hoveredCard = ref(null);
const joinedCommunities = ref(new Set());

const toggleJoin = (id) => {
  if (joinedCommunities.value.has(id)) {
    joinedCommunities.value.delete(id);
  } else {
    joinedCommunities.value.add(id);
  }
  joinedCommunities.value = new Set(joinedCommunities.value);
};

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const getOnlineCount = (total) => {
  return Math.floor(total * (0.05 + Math.random() * 0.15));
};

const getCategoryIcon = (type) => {
  const icons = {
    gaming: Gamepad2,
    tech: Code2,
    study: BookOpen,
    fun: Smile,
    business: Briefcase,
    design: Palette,
    discussion: MessageCircle,
    finance: Coins
  };
  return icons[type] || MessageCircle;
};

const getCategoryBadgeClass = (type) => {
  const classes = {
    gaming: "bg-purple-500/20 text-purple-300",
    tech: "bg-blue-500/20 text-blue-300",
    study: "bg-amber-500/20 text-amber-300",
    fun: "bg-pink-500/20 text-pink-300",
    business: "bg-emerald-500/20 text-emerald-300",
    design: "bg-rose-500/20 text-rose-300",
    discussion: "bg-cyan-500/20 text-cyan-300",
    finance: "bg-yellow-500/20 text-yellow-300"
  };
  return classes[type] || "bg-gray-500/20 text-gray-300";
};

const communities = ref([
  {
    id: "c1",
    name: "Pixel Raiders",
    description: "A fun place for gamers who love competition and teamwork.",
    totalUsers: 18420,
    posterImage: "https://picsum.photos/seed/gaming1/800/400",
    iconImage: "https://api.dicebear.com/7.x/bottts/png?seed=PixelRaiders",
    type: "gaming"
  },
  {
    id: "c2",
    name: "Tech Toon Hub",
    description: "Technology discussions with a playful twist.",
    totalUsers: 25680,
    posterImage: "https://picsum.photos/seed/tech1/800/400",
    iconImage: "https://api.dicebear.com/7.x/adventurer/png?seed=TechToon",
    type: "tech"
  },
  {
    id: "c3",
    name: "Study Squad",
    description: "Study together, stay motivated, and grow smarter.",
    totalUsers: 14230,
    posterImage: "https://picsum.photos/seed/study1/800/400",
    iconImage: "https://api.dicebear.com/7.x/fun-emoji/png?seed=StudySquad",
    type: "study"
  },
  {
    id: "c4",
    name: "Meme Town",
    description: "Memes, jokes, and unlimited fun.",
    totalUsers: 39210,
    posterImage: "https://picsum.photos/seed/fun1/800/400",
    iconImage: "https://api.dicebear.com/7.x/thumbs/png?seed=MemeTown",
    type: "fun"
  },
  {
    id: "c5",
    name: "Code Cartoons",
    description: "Coding concepts explained in a fun and simple way.",
    totalUsers: 22150,
    posterImage: "https://picsum.photos/seed/code1/800/400",
    iconImage: "https://api.dicebear.com/7.x/bottts/png?seed=CodeCartoon",
    type: "tech"
  },
  {
    id: "c6",
    name: "Esports Zone",
    description: "Follow esports teams, matches, and tournaments.",
    totalUsers: 19840,
    posterImage: "https://picsum.photos/seed/esports1/800/400",
    iconImage: "https://api.dicebear.com/7.x/adventurer/png?seed=Esports",
    type: "gaming"
  },
  {
    id: "c7",
    name: "Startup Stories",
    description: "Learn startups through stories and experiences.",
    totalUsers: 16790,
    posterImage: "https://picsum.photos/seed/startup1/800/400",
    iconImage: "https://api.dicebear.com/7.x/big-ears/png?seed=Startup",
    type: "business"
  },
  {
    id: "c8",
    name: "Design Play",
    description: "UI/UX design inspiration with creativity.",
    totalUsers: 14960,
    posterImage: "https://picsum.photos/seed/design1/800/400",
    iconImage: "https://api.dicebear.com/7.x/shapes/png?seed=DesignPlay",
    type: "design"
  },
  {
    id: "c9",
    name: "AI Playground",
    description: "Explore AI concepts in a friendly environment.",
    totalUsers: 23480,
    posterImage: "https://picsum.photos/seed/ai1/800/400",
    iconImage: "https://api.dicebear.com/7.x/bottts/png?seed=AIPlay",
    type: "tech"
  },
  {
    id: "c10",
    name: "Night Chatters",
    description: "Late night conversations and fun chats.",
    totalUsers: 12100,
    posterImage: "https://picsum.photos/seed/night1/800/400",
    iconImage: "https://api.dicebear.com/7.x/fun-emoji/png?seed=Night",
    type: "fun"
  },

  {
    id: "c11",
    name: "Math Heroes",
    description: "Solve math problems together.",
    totalUsers: 9850,
    posterImage: "https://picsum.photos/seed/math1/800/400",
    iconImage: "https://api.dicebear.com/7.x/adventurer/png?seed=MathHero",
    type: "study"
  },
  {
    id: "c12",
    name: "Web Wizards",
    description: "Frontend and backend magic.",
    totalUsers: 21340,
    posterImage: "https://picsum.photos/seed/web1/800/400",
    iconImage: "https://api.dicebear.com/7.x/bottts/png?seed=WebWizard",
    type: "tech"
  },
  {
    id: "c13",
    name: "Anime Cafe",
    description: "Anime talks, art, and recommendations.",
    totalUsers: 30210,
    posterImage: "https://picsum.photos/seed/anime1/800/400",
    iconImage: "https://api.dicebear.com/7.x/adventurer/png?seed=Anime",
    type: "fun"
  },
  {
    id: "c14",
    name: "Physics Fun",
    description: "Physics made simple and interesting.",
    totalUsers: 8760,
    posterImage: "https://picsum.photos/seed/physics1/800/400",
    iconImage: "https://api.dicebear.com/7.x/shapes/png?seed=Physics",
    type: "study"
  },
  {
    id: "c15",
    name: "Cloud Kids",
    description: "Cloud tech explained simply.",
    totalUsers: 15490,
    posterImage: "https://picsum.photos/seed/cloud1/800/400",
    iconImage: "https://api.dicebear.com/7.x/big-ears/png?seed=Cloud",
    type: "tech"
  },
  {
    id: "c16",
    name: "Chill Zone",
    description: "Relax, talk, and enjoy.",
    totalUsers: 11020,
    posterImage: "https://picsum.photos/seed/chill1/800/400",
    iconImage: "https://api.dicebear.com/7.x/fun-emoji/png?seed=Chill",
    type: "fun"
  },
  {
    id: "c17",
    name: "Mobile Monsters",
    description: "Mobile app dev discussions.",
    totalUsers: 13260,
    posterImage: "https://picsum.photos/seed/mobile1/800/400",
    iconImage: "https://api.dicebear.com/7.x/bottts/png?seed=Mobile",
    type: "tech"
  },
  {
    id: "c18",
    name: "Book Buddies",
    description: "Readers and book lovers unite.",
    totalUsers: 9470,
    posterImage: "https://picsum.photos/seed/books1/800/400",
    iconImage: "https://api.dicebear.com/7.x/adventurer/png?seed=Books",
    type: "study"
  },
  {
    id: "c19",
    name: "Crypto Cartoons",
    description: "Crypto explained in a fun way.",
    totalUsers: 17640,
    posterImage: "https://picsum.photos/seed/crypto1/800/400",
    iconImage: "https://api.dicebear.com/7.x/bottts/png?seed=Crypto",
    type: "finance"
  },
  {
    id: "c20",
    name: "Game Builders",
    description: "Game development and ideas.",
    totalUsers: 12890,
    posterImage: "https://picsum.photos/seed/gamedev1/800/400",
    iconImage: "https://api.dicebear.com/7.x/shapes/png?seed=GameDev",
    type: "gaming"
  },

  {
    id: "c21",
    name: "Debate Club",
    description: "Healthy debates and opinions.",
    totalUsers: 16530,
    posterImage: "https://picsum.photos/seed/debate1/800/400",
    iconImage: "https://api.dicebear.com/7.x/adventurer/png?seed=Debate",
    type: "discussion"
  },
  {
    id: "c22",
    name: "UI Cartoons",
    description: "Daily UI inspiration with style.",
    totalUsers: 14320,
    posterImage: "https://picsum.photos/seed/ui1/800/400",
    iconImage: "https://api.dicebear.com/7.x/shapes/png?seed=UI",
    type: "design"
  },
  {
    id: "c23",
    name: "Product Lab",
    description: "Build, test, and launch products.",
    totalUsers: 11840,
    posterImage: "https://picsum.photos/seed/product1/800/400",
    iconImage: "https://api.dicebear.com/7.x/big-ears/png?seed=Product",
    type: "business"
  },
  {
    id: "c24",
    name: "Linux Penguins",
    description: "Linux tips, tricks, and fun.",
    totalUsers: 20450,
    posterImage: "https://picsum.photos/seed/linux1/800/400",
    iconImage: "https://api.dicebear.com/7.x/bottts/png?seed=Linux",
    type: "tech"
  },
  {
    id: "c25",
    name: "Fun Experiments",
    description: "Playful projects and experiments.",
    totalUsers: 10230,
    posterImage: "https://picsum.photos/seed/experiment1/800/400",
    iconImage: "https://api.dicebear.com/7.x/fun-emoji/png?seed=Experiment",
    type: "fun"
  }
]);
</script>
