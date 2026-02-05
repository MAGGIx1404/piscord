<template>
  <main class="w-full pb-10">
    <!-- Hero Section with Banner & Profile -->
    <ProfileHero
      display-name="Jeet Ramoliya"
      username="maggix1404"
      avatar-image="/images/avatar/3.png"
      avatar-fallback="JR"
      banner-image="/images/servers/p-3.jpg"
      bio="🎮 Passionate gamer | 💻 Code enthusiast | 🌙 Night owl | Building cool stuff and connecting with awesome people. Let's play together! 🚀"
      joined-date="Jan 2024"
      :is-online="true"
      :is-premium="true"
      :is-own-profile="true"
      :stats="quickStats"
      @edit="handleEditProfile"
      @share="handleShare"
    />

    <!-- Main Content Grid -->
    <div class="w-full mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 px-6">
      <!-- Left Column -->
      <div class="space-y-6 sticky top-20 self-start">
        <!-- About Card -->
        <ProfileAbout
          location="San Francisco, CA"
          birthday="March 15, 2002"
          occupation="Software Developer"
          website="coolgamer.dev"
          website-url="https://coolgamer.dev"
          :editable="true"
          @edit="handleEditAbout"
        />

        <!-- Badges / Achievements -->
        <ProfileBadges :badges="badges" />

        <!-- Friends -->
        <ProfileFriends
          :friends="friends"
          :max-display="8"
          @view-all="handleViewAllFriends"
          @select="handleSelectFriend"
        />
      </div>

      <!-- Middle Column -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Communities -->
        <ProfileCommunities
          :communities="communities"
          @view-all="handleViewAllCommunities"
          @select="handleSelectCommunity"
        />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { Users, MessageSquare, Heart } from "lucide-vue-next";
import type { Component } from "vue";

interface Stat {
  icon: Component;
  value: string;
  label: string;
}

interface Badge {
  emoji: string;
  name: string;
  description: string;
  bg: string;
  color: string;
}

interface Friend {
  id: string | number;
  name: string;
  avatar: string;
  online?: boolean;
}

interface Community {
  id: string | number;
  name: string;
  icon: string;
  members: string | number;
  role: string;
}

const quickStats: Stat[] = [
  { icon: Users, value: "142", label: "Friends" },
  { icon: MessageSquare, value: "1.2K", label: "Messages" },
  { icon: Heart, value: "8", label: "Communities" }
];

const badges: Badge[] = [
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

const communities: Community[] = [
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

const friends: Friend[] = [
  { id: 1, name: "CyberNinja", avatar: "/images/avatar/1.png", online: true },
  { id: 2, name: "PixelQueen", avatar: "/images/avatar/2.png", online: true },
  { id: 3, name: "CodeMaster", avatar: "/images/avatar/4.png", online: false },
  { id: 4, name: "GameWizard", avatar: "/images/avatar/5.png", online: true },
  { id: 5, name: "CyberNinja", avatar: "/images/avatar/1.png", online: true },
  { id: 6, name: "PixelQueen", avatar: "/images/avatar/2.png", online: true },
  { id: 7, name: "CodeMaster", avatar: "/images/avatar/4.png", online: false },
  { id: 8, name: "GameWizard", avatar: "/images/avatar/5.png", online: true }
];

// Event handlers
function handleEditProfile() {
  console.log("Edit profile clicked");
}

function handleShare() {
  console.log("Share profile clicked");
}

function handleEditAbout() {
  console.log("Edit about clicked");
}

function handleViewAllFriends() {
  console.log("View all friends clicked");
}

function handleSelectFriend(friend: Friend) {
  console.log("Selected friend:", friend);
}

function handleViewAllCommunities() {
  console.log("View all communities clicked");
}

function handleSelectCommunity(community: Community) {
  console.log("Selected community:", community);
}
</script>
