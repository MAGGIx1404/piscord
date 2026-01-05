<template>
  <main class="w-full pb-10">
    <!-- Hero Section with Banner & Community Info -->
    <div class="w-full relative">
      <WidgetsImagePoster src="/images/servers/p-1.jpg" size="lg" />

      <!-- Community Card Overlay -->
      <div class="w-full -mt-24 relative z-10 px-6">
        <Card class="p-6 backdrop-blur-xl bg-card/90 shadow-2xl">
          <div class="flex flex-col md:flex-row gap-6">
            <!-- Community Icon Section -->
            <div class="relative shrink-0">
              <div class="relative group">
                <div
                  class="absolute -inset-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-500"
                />
                <div
                  class="relative flex aspect-square size-32 items-center justify-center rounded-xl bg-card ring-4 ring-card"
                >
                  <AudioWaveform class="size-16 text-primary" />
                </div>
                <!-- Verified badge -->
                <span class="absolute -top-2 -right-2 p-1.5 bg-blue-500 rounded-full">
                  <BadgeCheck class="size-5 text-white" />
                </span>
              </div>
            </div>

            <!-- Community Info -->
            <div class="flex-1 space-y-4">
              <div class="flex items-start justify-between flex-wrap gap-4">
                <div class="w-auto">
                  <div class="flex items-center gap-2">
                    <h1 class="text-2xl font-bold">{{ community.name }}</h1>
                    <Badge class="bg-blue-500 text-white">
                      <Shield class="size-4" />
                      Verified
                    </Badge>
                    <Badge variant="outline">
                      {{ community.type }}
                    </Badge>
                  </div>
                  <p class="text-sm text-muted-foreground">
                    Created {{ community.createdAt }} • {{ community.memberCount }} members
                  </p>
                </div>
                <div class="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings class="size-4" />
                    Settings
                  </Button>
                  <Button variant="outline" size="sm">
                    <Bell class="size-4" />
                    Notifications
                  </Button>
                  <Button size="sm">
                    <UserPlus class="size-4" />
                    Invite
                  </Button>
                </div>
              </div>

              <!-- Description -->
              <p class="text-sm max-w-xl">
                {{ community.description }}
              </p>

              <!-- Quick Stats -->
              <div class="flex flex-wrap gap-5">
                <Button v-for="stat in quickStats" :key="stat.label" variant="link" size="link">
                  <component :is="stat.icon" class="size-4 text-blue-500" />
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
      <div class="space-y-6">
        <!-- About Card -->
        <Card class="gap-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold flex items-center gap-2">
              <Info class="size-4" />
              About
            </h3>
            <Button variant="ghost" size="icon" class="size-7">
              <Pencil class="size-3" />
            </Button>
          </div>
          <div class="space-y-3 text-sm">
            <div class="flex items-center gap-3">
              <Globe class="size-4 text-muted-foreground" />
              <span>Public Community</span>
            </div>
            <div class="flex items-center gap-3">
              <Calendar class="size-4 text-muted-foreground" />
              <span>Created Jan 15, 2024</span>
            </div>
            <div class="flex items-center gap-3">
              <MapPin class="size-4 text-muted-foreground" />
              <span>Global</span>
            </div>
            <div class="flex items-center gap-3">
              <LinkIcon class="size-4 text-muted-foreground" />
              <a href="#" class="text-primary hover:underline">oriongroup.gg</a>
            </div>
          </div>
          <!-- Tags -->
          <div class="flex flex-wrap gap-2 pt-2">
            <Badge v-for="tag in community.tags" :key="tag" variant="secondary" class="text-xs">
              {{ tag }}
            </Badge>
          </div>
        </Card>

        <!-- Community Rules -->
        <Card class="gap-4">
          <h3 class="font-semibold flex items-center gap-2">
            <ScrollText class="size-4" />
            Community Rules
          </h3>
          <div class="space-y-2">
            <div
              v-for="(rule, index) in communityRules"
              :key="index"
              class="flex gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <span
                class="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium shrink-0"
              >
                {{ index + 1 }}
              </span>
              <span class="text-muted-foreground">{{ rule }}</span>
            </div>
          </div>
        </Card>

        <!-- Workspaces -->
        <Card class="gap-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold flex items-center gap-2">
              <Layers class="size-4" />
              Workspaces
            </h3>
            <Badge variant="secondary">{{ workspaces.length }}</Badge>
          </div>
          <div class="space-y-2">
            <div
              v-for="workspace in workspaces"
              :key="workspace.id"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
            >
              <div
                class="size-8 rounded-lg flex items-center justify-center"
                :class="workspace.color"
              >
                <component :is="workspace.icon" class="size-4" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm truncate">{{ workspace.name }}</p>
                <p class="text-xs text-muted-foreground">{{ workspace.channelCount }} channels</p>
              </div>
              <ChevronRight
                class="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </Card>
      </div>

      <!-- Middle Column -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Community Stats Chart -->
        <WidgetsStatsChart
          title="Community Stats"
          description="Activity overview showing members, messages, and engagement metrics."
        />

        <!-- Members by Role -->
        <Card>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold flex items-center gap-2">
              <Users class="size-4" />
              Members
            </h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>

          <!-- Role Tabs -->
          <Tabs v-model="selectedRole" class="w-full">
            <TabsList>
              <TabsTrigger
                v-for="role in memberRoles"
                :key="role.id"
                :value="role.id"
                class="max-w-max px-4"
              >
                <span class="size-2 rounded-full" :class="role.dotColor" />
                {{ role.label }}
              </TabsTrigger>
            </TabsList>

            <TabsContent :value="selectedRole" class="mt-4">
              <!-- Members Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  v-for="member in filteredMembers"
                  :key="member.id"
                  class="flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div class="relative">
                    <Avatar class="size-10">
                      <AvatarImage :src="member.avatar" />
                      <AvatarFallback>{{ member.name.charAt(0) }}</AvatarFallback>
                    </Avatar>
                    <span
                      v-if="member.online"
                      class="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-card"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="font-medium text-sm truncate">{{ member.name }}</p>
                      <Crown v-if="member.role === 'owner'" class="size-3 text-yellow-500" />
                      <Shield v-else-if="member.role === 'admin'" class="size-3 text-red-500" />
                      <Wrench v-else-if="member.role === 'mod'" class="size-3 text-blue-500" />
                    </div>
                    <p class="text-xs text-muted-foreground">{{ member.status }}</p>
                  </div>
                  <Badge :class="getRoleBadgeClass(member.role)" class="text-xs">
                    {{ member.role }}
                  </Badge>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <!-- Channels -->
        <Card>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold flex items-center gap-2">
              <Hash class="size-4" />
              Channels
            </h3>
            <Button variant="ghost" size="sm">
              <Plus class="size-4" />
              New Channel
            </Button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="channel in channels"
              :key="channel.id"
              class="flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-accent/50 transition-colors cursor-pointer group"
            >
              <div
                class="size-10 rounded-lg flex items-center justify-center"
                :class="channel.iconBg"
              >
                <component :is="channel.icon" class="size-5" :class="channel.iconColor" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm truncate"># {{ channel.name }}</p>
                <p class="text-xs text-muted-foreground">{{ channel.lastActivity }}</p>
              </div>
              <div class="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare class="size-3" />
                {{ channel.messageCount }}
              </div>
            </div>
          </div>
        </Card>

        <!-- Recent Activity -->
        <Card>
          <h3 class="font-semibold flex items-center gap-2">
            <Clock class="size-4" />
            Recent Activity
          </h3>
          <div class="space-y-1">
            <div
              v-for="activity in recentActivity"
              :key="activity.id"
              class="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
            >
              <Avatar class="size-10 shrink-0">
                <AvatarImage :src="activity.userAvatar" />
                <AvatarFallback>{{ activity.userName.charAt(0) }}</AvatarFallback>
              </Avatar>
              <div class="flex-1 min-w-0">
                <p class="text-sm">
                  <span class="font-medium">{{ activity.userName }}</span>
                  <span class="text-muted-foreground"> {{ activity.action }}</span>
                </p>
                <p class="text-xs text-muted-foreground">{{ activity.time }}</p>
              </div>
              <ChevronRight
                class="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity self-center"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  </main>
</template>

<script setup>
import {
  AudioWaveform,
  Settings,
  Bell,
  UserPlus,
  Shield,
  BadgeCheck,
  Users,
  MessageSquare,
  Hash,
  Layers,
  Info,
  Pencil,
  Globe,
  Calendar,
  MapPin,
  LinkIcon,
  ScrollText,
  ChevronRight,
  Clock,
  Crown,
  Wrench,
  Plus,
  Mic,
  Video,
  Megaphone,
  BookOpen,
  Code,
  Gamepad2,
  Music
} from "lucide-vue-next";

const community = {
  id: "orion_group",
  name: "Orion Group",
  type: "Enterprise",
  description:
    "🚀 Welcome to Orion Group! A thriving community of developers, designers, and tech enthusiasts. Join us for discussions, collaborations, and fun events. Building the future together! 💻",
  createdAt: "Jan 2024",
  memberCount: "18.4K",
  tags: ["Technology", "Gaming", "Development", "Community", "Esports"]
};

const quickStats = [
  { icon: Users, value: "18.4K", label: "Members" },
  { icon: MessageSquare, value: "124K", label: "Messages" },
  { icon: Hash, value: "42", label: "Channels" },
  { icon: Layers, value: "6", label: "Workspaces" }
];

const communityRules = [
  "Be respectful to all members",
  "No spam or self-promotion",
  "Keep discussions on topic",
  "No NSFW content",
  "Follow Discord ToS"
];

const workspaces = [
  {
    id: 1,
    name: "General",
    icon: MessageSquare,
    color: "bg-blue-500/20 text-blue-500",
    channelCount: 8
  },
  {
    id: 2,
    name: "Development",
    icon: Code,
    color: "bg-green-500/20 text-green-500",
    channelCount: 12
  },
  {
    id: 3,
    name: "Gaming",
    icon: Gamepad2,
    color: "bg-purple-500/20 text-purple-500",
    channelCount: 6
  },
  { id: 4, name: "Music", icon: Music, color: "bg-pink-500/20 text-pink-500", channelCount: 4 },
  {
    id: 5,
    name: "Learning",
    icon: BookOpen,
    color: "bg-amber-500/20 text-amber-500",
    channelCount: 7
  }
];

const memberRoles = [
  { id: "all", label: "All", count: 18420, dotColor: "bg-gray-500" },
  { id: "owner", label: "Owner", count: 1, dotColor: "bg-yellow-500" },
  { id: "admin", label: "Admins", count: 5, dotColor: "bg-red-500" },
  { id: "mod", label: "Mods", count: 12, dotColor: "bg-blue-500" },
  { id: "member", label: "Members", count: 18402, dotColor: "bg-green-500" }
];

const selectedRole = ref("all");

const members = [
  {
    id: 1,
    name: "CyberNinja",
    avatar: "/images/avatar/1.png",
    role: "owner",
    status: "Building something awesome",
    online: true
  },
  {
    id: 2,
    name: "PixelQueen",
    avatar: "/images/avatar/2.png",
    role: "admin",
    status: "Available",
    online: true
  },
  {
    id: 3,
    name: "CodeMaster",
    avatar: "/images/avatar/3.png",
    role: "admin",
    status: "In a meeting",
    online: true
  },
  {
    id: 4,
    name: "GameWizard",
    avatar: "/images/avatar/4.png",
    role: "mod",
    status: "Playing games",
    online: true
  },
  {
    id: 5,
    name: "TechGuru",
    avatar: "/images/avatar/5.png",
    role: "mod",
    status: "Coding...",
    online: false
  },
  {
    id: 6,
    name: "StarPlayer",
    avatar: "/images/avatar/1.png",
    role: "member",
    status: "Chilling",
    online: true
  },
  {
    id: 7,
    name: "NightOwl",
    avatar: "/images/avatar/2.png",
    role: "member",
    status: "Away",
    online: false
  },
  {
    id: 8,
    name: "ProGamer",
    avatar: "/images/avatar/3.png",
    role: "member",
    status: "Online",
    online: true
  }
];

const filteredMembers = computed(() => {
  if (selectedRole.value === "all") return members;
  return members.filter((m) => m.role === selectedRole.value);
});

const getRoleBadgeClass = (role) => {
  const classes = {
    owner: "bg-yellow-500 text-white",
    admin: "bg-red-500 text-white",
    mod: "bg-blue-500 text-white",
    member: "bg-green-500/20 text-green-500"
  };
  return classes[role] || "bg-muted";
};

const channels = [
  {
    id: 1,
    name: "general",
    icon: MessageSquare,
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-500",
    lastActivity: "Just now",
    messageCount: "12.4K"
  },
  {
    id: 2,
    name: "announcements",
    icon: Megaphone,
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-500",
    lastActivity: "2h ago",
    messageCount: "342"
  },
  {
    id: 3,
    name: "voice-chat",
    icon: Mic,
    iconBg: "bg-green-500/20",
    iconColor: "text-green-500",
    lastActivity: "Active",
    messageCount: "—"
  },
  {
    id: 4,
    name: "dev-talk",
    icon: Code,
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-500",
    lastActivity: "5m ago",
    messageCount: "8.2K"
  },
  {
    id: 5,
    name: "gaming",
    icon: Gamepad2,
    iconBg: "bg-pink-500/20",
    iconColor: "text-pink-500",
    lastActivity: "1h ago",
    messageCount: "5.1K"
  },
  {
    id: 6,
    name: "stream",
    icon: Video,
    iconBg: "bg-red-500/20",
    iconColor: "text-red-500",
    lastActivity: "Live",
    messageCount: "1.2K"
  }
];

const recentActivity = [
  {
    id: 1,
    userName: "CyberNinja",
    userAvatar: "/images/avatar/1.png",
    action: "created a new channel #announcements",
    time: "2 minutes ago"
  },
  {
    id: 2,
    userName: "PixelQueen",
    userAvatar: "/images/avatar/2.png",
    action: "promoted GameWizard to Moderator",
    time: "1 hour ago"
  },
  {
    id: 3,
    userName: "CodeMaster",
    userAvatar: "/images/avatar/3.png",
    action: "updated community rules",
    time: "3 hours ago"
  },
  {
    id: 4,
    userName: "GameWizard",
    userAvatar: "/images/avatar/4.png",
    action: "started a voice channel",
    time: "5 hours ago"
  }
];
</script>
