<template>
  <main class="w-full min-h-screen">
    <!-- Hero Banner -->
    <CommunityBanner
      :name="community.name"
      :type="community.type"
      :description="community.description"
      :banner-image="community.bannerImage"
      :verified="true"
      @notify="handleNotify"
      @settings="handleSettings"
      @invite="handleInvite"
    />

    <!-- Sticky Stats Bar -->
    <CommunityStatsBar :stats="quickStats" v-model:active-tab="activeTab" />

    <!-- Main content - asymmetric bento -->
    <div class="w-full px-8 py-8">
      <div class="grid grid-cols-12 gap-5">
        <!-- Left narrow column -->
        <div class="col-span-12 lg:col-span-3 space-y-5">
          <!-- AI Agent -->
          <CommunityAIAgent :agent="aiAgent" @view-profile="handleViewAgentProfile" />

          <!-- About -->
          <CommunityAbout
            :created-at="community.createdAt"
            :website="community.website"
            :tags="community.tags"
          />

          <!-- Rules -->
          <CommunityRules :rules="communityRules" />

          <!-- Workspaces -->
          <CommunityWorkspaces :workspaces="workspaces" @select="handleSelectWorkspace" />
        </div>

        <!-- Center wide column -->
        <div class="col-span-12 lg:col-span-6 space-y-5">
          <!-- Community Pulse -->
          <CommunityPulse
            :active-now="47"
            :today-messages="128"
            :new-members="12"
            @select-topic="handleSelectTopic"
            @join-event="handleJoinEvent"
          />

          <!-- Channels Grid -->
          <CommunityChannelGrid
            :channels="channels"
            @create="handleCreateChannel"
            @select="handleSelectChannel"
          />
        </div>

        <!-- Right column - members focus -->
        <div class="col-span-12 lg:col-span-3 space-y-5">
          <!-- Online Now -->
          <CommunityOnlineNow :online-members="onlineMembers" @select-member="handleSelectMember" />

          <!-- Roles Filter -->
          <CommunityRolesFilter
            :roles="memberRoles.filter((r) => r.id !== 'all')"
            v-model:selected-role="selectedRole"
          />

          <!-- Member List -->
          <CommunityMemberList
            :members="filteredMembers"
            @view-all="handleViewAllMembers"
            @select-member="handleSelectMember"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
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
import { markRaw } from "vue";

// Community data
const community = {
  id: "orion_group",
  name: "Orion Group",
  type: "Enterprise",
  description:
    "🚀 Welcome to Orion Group! A thriving community of developers, designers, and tech enthusiasts. Join us for discussions, collaborations, and fun events. Building the future together! 💻",
  createdAt: "Jan 2024",
  memberCount: "18.4K",
  bannerImage: "/images/servers/p-1.jpg",
  website: "https://oriongroup.gg",
  tags: ["Technology", "Gaming", "Development", "Community", "Esports"]
};

// AI Agent
const aiAgent = {
  id: "orion_ai",
  name: "Orion",
  petName: "The Cosmic Helper",
  avatar: "/images/avatar/ai.png"
};

// Stats
const quickStats = [
  { icon: markRaw(Users), value: "18.4K", label: "Members" },
  { icon: markRaw(MessageSquare), value: "124K", label: "Messages" },
  { icon: markRaw(Hash), value: "42", label: "Channels" },
  { icon: markRaw(Layers), value: "6", label: "Workspaces" }
];

// Rules
const communityRules = [
  "Be respectful to all members",
  "No spam or self-promotion",
  "Keep discussions on topic",
  "No NSFW content",
  "Follow Discord ToS"
];

// Workspaces
const workspaces = [
  {
    id: 1,
    name: "General",
    icon: markRaw(MessageSquare),
    color: "bg-blue-500/20 text-blue-500",
    channelCount: 8
  },
  {
    id: 2,
    name: "Development",
    icon: markRaw(Code),
    color: "bg-green-500/20 text-green-500",
    channelCount: 12
  },
  {
    id: 3,
    name: "Gaming",
    icon: markRaw(Gamepad2),
    color: "bg-purple-500/20 text-purple-500",
    channelCount: 6
  },
  {
    id: 4,
    name: "Music",
    icon: markRaw(Music),
    color: "bg-pink-500/20 text-pink-500",
    channelCount: 4
  },
  {
    id: 5,
    name: "Learning",
    icon: markRaw(BookOpen),
    color: "bg-amber-500/20 text-amber-500",
    channelCount: 7
  }
];

// Roles
const memberRoles = [
  { id: "all", label: "All", count: 18420, dotColor: "bg-gray-500" },
  { id: "owner", label: "Owner", count: 1, dotColor: "bg-yellow-500" },
  { id: "admin", label: "Admins", count: 5, dotColor: "bg-red-500" },
  { id: "mod", label: "Mods", count: 12, dotColor: "bg-blue-500" },
  { id: "member", label: "Members", count: 18402, dotColor: "bg-green-500" }
];

// Members
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

// Channels
const channels = [
  {
    id: 1,
    name: "general",
    icon: markRaw(MessageSquare),
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-500",
    lastActivity: "Just now",
    messageCount: "12.4K"
  },
  {
    id: 2,
    name: "announcements",
    icon: markRaw(Megaphone),
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-500",
    lastActivity: "2h ago",
    messageCount: "342"
  },
  {
    id: 3,
    name: "voice-chat",
    icon: markRaw(Mic),
    iconBg: "bg-green-500/20",
    iconColor: "text-green-500",
    lastActivity: "Active",
    messageCount: "—"
  },
  {
    id: 4,
    name: "dev-talk",
    icon: markRaw(Code),
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-500",
    lastActivity: "5m ago",
    messageCount: "8.2K"
  },
  {
    id: 5,
    name: "gaming",
    icon: markRaw(Gamepad2),
    iconBg: "bg-pink-500/20",
    iconColor: "text-pink-500",
    lastActivity: "1h ago",
    messageCount: "5.1K"
  },
  {
    id: 6,
    name: "stream",
    icon: markRaw(Video),
    iconBg: "bg-red-500/20",
    iconColor: "text-red-500",
    lastActivity: "Live",
    messageCount: "1.2K"
  }
];

// State
const activeTab = ref("Overview");
const selectedRole = ref("all");

// Computed
const onlineMembers = computed(() => members.filter((m) => m.online));
const filteredMembers = computed(() => {
  if (selectedRole.value === "all") return members;
  return members.filter((m) => m.role === selectedRole.value);
});

// Event handlers
const handleNotify = () => console.log("Notify clicked");
const handleSettings = () => console.log("Settings clicked");
const handleInvite = () => console.log("Invite clicked");
const handleSelectWorkspace = (workspace: any) => console.log("Selected workspace:", workspace);
const handleSelectTopic = (topic: any) => console.log("Selected topic:", topic);
const handleJoinEvent = (event: any) => console.log("Join event:", event);
const handleCreateChannel = () => console.log("Create channel");
const handleSelectChannel = (channel: any) => console.log("Selected channel:", channel);
const handleSelectMember = (member: any) => console.log("Selected member:", member);
const handleViewAllMembers = () => console.log("View all members");
const handleViewAgentProfile = () => console.log("View AI agent profile");
</script>
