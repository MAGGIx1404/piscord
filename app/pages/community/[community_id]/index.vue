<template>
  <main class="w-full pb-10">
    <!-- Hero Section with Banner & Community Info -->
    <CommunityHero
      :name="community.name"
      :type="community.type"
      :description="community.description"
      :created-at="community.createdAt"
      :member-count="community.memberCount"
      :stats="quickStats"
    />

    <!-- Main Content Grid -->
    <div class="w-full mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 px-6">
      <!-- Left Column -->
      <div class="space-y-6">
        <!-- About Card -->
        <CommunityAbout
          :created-at="'Jan 15, 2024'"
          :website="'https://oriongroup.gg'"
          :tags="community.tags"
        />

        <!-- Community Rules -->
        <CommunityRules :rules="communityRules" />

        <!-- Workspaces -->
        <CommunityWorkspaces :workspaces="workspaces" />
      </div>

      <!-- Middle Column -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Community Stats Chart -->
        <WidgetsStatsChart
          title="Community Stats"
          description="Activity overview showing members, messages, and engagement metrics."
        />

        <!-- Members by Role -->
        <CommunityMembers
          v-model:selected-role="selectedRole"
          :roles="memberRoles"
          :members="members"
        />

        <!-- Channels -->
        <CommunityChannels :channels="channels" />

        <!-- Recent Activity -->
        <CommunityActivity :activities="recentActivity" />
      </div>
    </div>
  </main>
</template>

<script setup>
import {
  Users,
  MessageSquare,
  Hash,
  Layers,
  Code,
  Gamepad2,
  Music,
  BookOpen,
  Mic,
  Video,
  Megaphone
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
