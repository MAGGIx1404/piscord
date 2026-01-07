<template>
  <main class="w-full pb-10">
    <!-- Workspace Header -->
    <div class="w-full px-4 pt-6">
      <WorkspaceHeader
        :name="workspace.name"
        :icon="FileText"
        icon-class="text-emerald-500"
        :is-public="workspace.isPublic"
        :created-at="workspace.createdAt"
        :last-edited="workspace.lastEdited"
        :active-users="activeUsers"
        :collaborators-count="workspace.collaborators"
        :views-count="workspace.views"
        :comments-count="workspace.comments"
        :word-count="documentInfo.wordCount"
        :reading-time="documentInfo.readingTime"
        @share="handleShare"
        @favorite="handleFavorite"
        @duplicate="handleDuplicate"
        @history="handleHistory"
        @delete="handleDelete"
      />
    </div>

    <!-- Main Content Grid -->
    <div class="w-full mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6 px-4">
      <!-- Editor (Main Content) -->
      <div class="lg:col-span-3">
        <ClientOnly>
          <WorkspaceEditor v-model="content" />
        </ClientOnly>
      </div>

      <!-- Right Sidebar -->
      <div class="space-y-6 sticky top-16 h-max">
        <!-- Collaborators Card -->
        <WorkspaceCollaborators
          :collaborators="collaborators"
          @add="handleAddCollaborator"
          @select="handleSelectCollaborator"
        />

        <!-- Activity Card -->
        <WorkspaceActivity
          :activities="activities"
          @view-all="handleViewAllActivities"
          @select="handleSelectActivity"
        />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import Intro from "@/assets/intro/workspace.txt?raw";
import { FileText, Edit3, MessageCircle, Image, Link } from "lucide-vue-next";
import type { Component } from "vue";

interface ActiveUser {
  id: string | number;
  name: string;
  avatar: string;
  initials: string;
}

interface Collaborator {
  id: string | number;
  name: string;
  avatar: string;
  initials: string;
  role: string;
  isOnline?: boolean;
  isEditing?: boolean;
}

interface ActivityUser {
  name: string;
  avatar: string;
  initials: string;
}

interface ActivityItem {
  id: string | number;
  user: ActivityUser;
  action: string;
  time: string;
  icon?: Component;
}

const content = ref<string>(Intro);

const workspace = ref({
  name: "Project Documentation",
  isPublic: true,
  createdAt: "Dec 15, 2025",
  lastEdited: "2 hours ago",
  collaborators: 8,
  views: 234,
  comments: 12
});

const activeUsers = ref<ActiveUser[]>([
  { id: 1, name: "Sarah Chen", avatar: "/images/avatar/1.png", initials: "SC" },
  { id: 2, name: "Alex Rivera", avatar: "/images/avatar/2.png", initials: "AR" },
  { id: 3, name: "Mike Johnson", avatar: "/images/avatar/3.png", initials: "MJ" },
  { id: 4, name: "Emily Davis", avatar: "/images/avatar/4.png", initials: "ED" },
  { id: 5, name: "Chris Lee", avatar: "/images/avatar/5.png", initials: "CL" }
]);

const collaborators = ref<Collaborator[]>([
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "/images/avatar/1.png",
    initials: "SC",
    role: "Owner",
    isOnline: true,
    isEditing: true
  },
  {
    id: 2,
    name: "Alex Rivera",
    avatar: "/images/avatar/2.png",
    initials: "AR",
    role: "Editor",
    isOnline: true,
    isEditing: false
  },
  {
    id: 3,
    name: "Mike Johnson",
    avatar: "/images/avatar/3.png",
    initials: "MJ",
    role: "Editor",
    isOnline: false,
    isEditing: false
  },
  {
    id: 4,
    name: "Emily Davis",
    avatar: "/images/avatar/4.png",
    initials: "ED",
    role: "Viewer",
    isOnline: true,
    isEditing: false
  },
  {
    id: 5,
    name: "Chris Lee",
    avatar: "/images/avatar/5.png",
    initials: "CL",
    role: "Viewer",
    isOnline: false,
    isEditing: false
  }
]);

const activities = ref<ActivityItem[]>([
  {
    id: 1,
    user: { name: "Sarah", avatar: "/images/avatar/1.png", initials: "SC" },
    action: "edited the introduction section",
    time: "2 min ago",
    icon: Edit3
  },
  {
    id: 2,
    user: { name: "Alex", avatar: "/images/avatar/2.png", initials: "AR" },
    action: "added a comment",
    time: "15 min ago",
    icon: MessageCircle
  },
  {
    id: 3,
    user: { name: "Emily", avatar: "/images/avatar/4.png", initials: "ED" },
    action: "uploaded an image",
    time: "1 hour ago",
    icon: Image
  },
  {
    id: 4,
    user: { name: "Mike", avatar: "/images/avatar/3.png", initials: "MJ" },
    action: "added a new link",
    time: "3 hours ago",
    icon: Link
  }
]);

const documentInfo = ref({
  wordCount: "1,247",
  charCount: "7,823",
  readingTime: "5 min",
  created: "Dec 15, 2025",
  modified: "Jan 6, 2026"
});

// Event handlers
function handleShare() {
  console.log("Share clicked");
}

function handleFavorite() {
  console.log("Add to favorites clicked");
}

function handleDuplicate() {
  console.log("Duplicate clicked");
}

function handleHistory() {
  console.log("Version history clicked");
}

function handleDelete() {
  console.log("Delete clicked");
}

function handleAddCollaborator() {
  console.log("Add collaborator clicked");
}

function handleSelectCollaborator(user: Collaborator) {
  console.log("Selected collaborator:", user);
}

function handleViewAllActivities() {
  console.log("View all activities clicked");
}

function handleSelectActivity(activity: ActivityItem) {
  console.log("Selected activity:", activity);
}
</script>
