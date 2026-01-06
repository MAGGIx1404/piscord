<template>
  <main class="w-full pb-10">
    <!-- Hero Section with Banner & Profile -->
    <div class="w-full relative">
      <WidgetsImagePoster src="/images/servers/p-3.jpg" size="lg" />

      <!-- Profile Card Overlay -->
      <div class="w-full -mt-24 relative z-10 px-6">
        <Card class="p-6 backdrop-blur-xl bg-card/90 shadow-2xl">
          <div class="flex flex-col md:flex-row gap-6">
            <!-- Avatar Section -->
            <div class="relative shrink-0">
              <div class="relative group">
                <div
                  class="absolute -inset-1 bg-linear-to-r from-primary via-purple-500 to-pink-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500"
                />
                <Avatar class="relative size-32 ring-4 ring-card">
                  <AvatarImage src="/images/avatar/3.png" />
                  <AvatarFallback class="text-3xl">OG</AvatarFallback>
                </Avatar>
                <!-- Status indicator -->
                <span class="absolute bottom-2 right-2 flex size-5">
                  <span
                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                  />
                  <span
                    class="relative inline-flex rounded-full size-5 bg-green-500 border-3 border-card"
                  />
                </span>
              </div>
            </div>

            <!-- User Info -->
            <div class="flex-1 space-y-4">
              <div class="flex items-start justify-between flex-wrap gap-4">
                <div class="w-auto">
                  <div class="flex items-center gap-2">
                    <h1 class="text-2xl font-bold">Jeet Ramoliya</h1>
                    <Badge class="bg-purple-500 text-primary">
                      <Sparkles class="size-4" />
                      Premium
                    </Badge>
                  </div>
                  <p class="text-sm text-muted-foreground">@maggix1404 • Joined Jan 2024</p>
                </div>
                <div class="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings class="size-4" />
                    Edit Profile
                  </Button>
                  <Button size="sm">
                    <Share2 class="size-4" />
                    Share
                  </Button>
                </div>
              </div>

              <!-- Bio -->
              <p class="text-sm max-w-xl">
                🎮 Passionate gamer | 💻 Code enthusiast | 🌙 Night owl | Building cool stuff and
                connecting with awesome people. Let's play together! 🚀
              </p>

              <!-- Quick Stats -->
              <div class="flex flex-wrap gap-5">
                <Button v-for="stat in quickStats" :key="stat.label" variant="link" size="link">
                  <component :is="stat.icon" class="size-4 text-purple-500" />
                  {{ stat.value }} {{ stat.label }}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="w-full mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 px-6">
      <!-- Left Column -->
      <div class="space-y-6 sticky top-20 self-start">
        <!-- About Card -->
        <Card class="gap-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold flex items-center gap-2">
              <User class="size-4" />
              About Me
            </h3>
            <Button variant="ghost" size="icon" class="size-7">
              <Pencil class="size-3" />
            </Button>
          </div>
          <div class="space-y-3 text-sm">
            <div class="flex items-center gap-3">
              <MapPin class="size-4 text-muted-foreground" />
              <span>San Francisco, CA</span>
            </div>
            <div class="flex items-center gap-3">
              <Cake class="size-4 text-muted-foreground" />
              <span>March 15, 2002</span>
            </div>
            <div class="flex items-center gap-3">
              <Briefcase class="size-4 text-muted-foreground" />
              <span>Software Developer</span>
            </div>
            <div class="flex items-center gap-3">
              <Globe class="size-4 text-muted-foreground" />
              <a href="#" class="text-primary hover:underline">coolgamer.dev</a>
            </div>
          </div>
        </Card>

        <!-- Badges / Achievements -->
        <Card>
          <h3 class="font-semibold flex items-center gap-2">
            <Award class="size-4" />
            Badges
          </h3>
          <div class="flex flex-wrap gap-2">
            <Tooltip v-for="badge in badges" :key="badge.name">
              <TooltipTrigger>
                <div
                  class="size-12 rounded-xl flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-transform"
                  :class="badge.bg"
                >
                  {{ badge.emoji }}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p class="font-medium">{{ badge.name }}</p>
                <p class="text-xs" :class="badge.color">{{ badge.description }}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </Card>

        <!-- Friends -->
        <Card>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold flex items-center gap-2">
              <Heart class="size-4" />
              Friends
            </h3>
            <Button variant="ghost" size="sm" class="text-xs">View All</Button>
          </div>
          <div class="flex flex-wrap gap-2">
            <Tooltip v-for="friend in friends" :key="friend.id">
              <TooltipTrigger>
                <div class="relative">
                  <Avatar
                    class="size-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  >
                    <AvatarImage :src="friend.avatar" />
                    <AvatarFallback>{{ friend.name.charAt(0) }}</AvatarFallback>
                  </Avatar>
                  <span
                    v-if="friend.online"
                    class="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-card"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{{ friend.name }}</p>
                <p
                  class="text-xs"
                  :class="friend.online ? 'text-green-400' : 'text-muted-foreground'"
                >
                  {{ friend.online ? "Online" : "Offline" }}
                </p>
              </TooltipContent>
            </Tooltip>
            <div
              class="size-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium cursor-pointer hover:bg-muted/80 transition-colors"
            >
              +130
            </div>
          </div>
        </Card>
      </div>

      <!-- Middle Column -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Activity Chart -->
        <WidgetsActivityChart />

        <!-- Communities -->
        <Card>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold flex items-center gap-2">
              <Users class="size-4" />
              Communities
            </h3>
            <Button variant="ghost" size="sm"> View All </Button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="community in communities"
              :key="community.id"
              class="flex items-center gap-4 p-4 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer"
            >
              <Avatar class="size-12 bg-foreground rounded-md">
                <AvatarImage :src="community.icon" />
                <AvatarFallback>{{ community.name.charAt(0) }}</AvatarFallback>
              </Avatar>
              <div class="flex-1">
                <h4 class="font-medium">{{ community.name }}</h4>
                <p class="text-xs text-muted-foreground">{{ community.members }} members</p>
              </div>
              <Badge
                :class="
                  community.role === 'Admin'
                    ? 'bg-red-500 text-primary'
                    : community.role === 'Mod'
                    ? 'bg-blue-500 text-primary'
                    : 'bg-green-500 text-primary'
                "
              >
                {{ community.role }}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </main>
</template>

<script setup>
import {
  Settings,
  Share2,
  Users,
  MessageSquare,
  Heart,
  Sparkles,
  User,
  Pencil,
  MapPin,
  Cake,
  Briefcase,
  Globe,
  Award
} from "lucide-vue-next";

const quickStats = [
  { icon: Users, value: "142", label: "Friends" },
  { icon: MessageSquare, value: "1.2K", label: "Messages" },
  { icon: Heart, value: "8", label: "Communities" }
];

const badges = [
  {
    emoji: "🎮",
    name: "OG Gamer",
    description: "Member since day one",
    bg: "bg-purple-500/20",
    color: "text-purple-500"
  },
  {
    emoji: "⚡",
    name: "Speed Demon",
    description: "First to reply 100 times",
    bg: "bg-yellow-500/20",
    color: "text-yellow-500"
  },
  {
    emoji: "🔥",
    name: "Hot Streak",
    description: "30 day activity streak",
    bg: "bg-orange-500/20",
    color: "text-orange-500"
  },
  {
    emoji: "💎",
    name: "Premium",
    description: "Premium subscriber",
    bg: "bg-blue-500/20",
    color: "text-blue-500"
  },
  {
    emoji: "🎯",
    name: "Sharpshooter",
    description: "100 headshots in a row",
    bg: "bg-red-500/20",
    color: "text-red-500"
  },
  {
    emoji: "🌟",
    name: "Rising Star",
    description: "Top contributor",
    bg: "bg-amber-500/20",
    color: "text-amber-500"
  }
];

const communities = [
  {
    id: 1,
    name: "Pixel Raiders",
    icon: "https://api.dicebear.com/7.x/bottts/png?seed=PixelRaiders",
    members: "18.4K",
    role: "Admin"
  },
  {
    id: 2,
    name: "Tech Toon Hub",
    icon: "https://api.dicebear.com/7.x/adventurer/png?seed=TechToon",
    members: "25.6K",
    role: "Member"
  },
  {
    id: 3,
    name: "Study Squad",
    icon: "https://api.dicebear.com/7.x/fun-emoji/png?seed=StudySquad",
    members: "14.2K",
    role: "Mod"
  }
];

const friends = [
  {
    id: 1,
    name: "CyberNinja",
    avatar: "/images/avatar/1.png",
    online: true
  },
  {
    id: 2,
    name: "PixelQueen",
    avatar: "/images/avatar/2.png",
    online: true
  },
  {
    id: 3,
    name: "CodeMaster",
    avatar: "/images/avatar/4.png",
    online: false
  },
  {
    id: 4,
    name: "GameWizard",
    avatar: "/images/avatar/5.png",
    online: true
  },
  {
    id: 5,
    name: "CyberNinja",
    avatar: "/images/avatar/1.png",
    online: true
  },
  {
    id: 6,
    name: "PixelQueen",
    avatar: "/images/avatar/2.png",
    online: true
  },
  {
    id: 7,
    name: "CodeMaster",
    avatar: "/images/avatar/4.png",
    online: false
  },
  {
    id: 8,
    name: "GameWizard",
    avatar: "/images/avatar/5.png",
    online: true
  }
];
</script>
