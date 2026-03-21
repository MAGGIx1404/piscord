<template>
  <main class="relative -mb-5 min-h-screen w-full">
    <!-- Minimal Header Bar -->
    <div class="sticky top-0 z-20 border-b border-border/50 bg-background/90 px-6 backdrop-blur-xl">
      <div class="flex items-center justify-between py-3">
        <!-- Left: Breadcrumb & Title -->
        <div class="flex items-center gap-3">
          <div class="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10">
            <FileText class="size-4 text-emerald-500" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="font-semibold">{{ workspace.name }}</h1>
              <Badge
                variant="outline"
                class="text-xs"
                :class="workspace.isPublic ? 'border-emerald-500/30 text-emerald-500' : ''"
              >
                <component :is="workspace.isPublic ? Globe : Lock" class="mr-1 size-3" />
                {{ workspace.isPublic ? "Public" : "Private" }}
              </Badge>
            </div>
            <p class="text-xs text-muted-foreground">Last edited {{ workspace.lastEdited }}</p>
          </div>
        </div>

        <!-- Center: Active Collaborators -->
        <div class="hidden items-center gap-2 md:flex">
          <div class="flex -space-x-2">
            <TooltipProvider>
              <Tooltip v-for="user in activeUsers.slice(0, 4)" :key="user.id">
                <TooltipTrigger>
                  <Avatar
                    class="size-7 cursor-pointer ring-2 ring-background transition-all hover:z-10 hover:ring-primary"
                  >
                    <AvatarImage :src="user.avatar" />
                    <AvatarFallback class="text-xs">{{ user.initials }}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p class="text-xs">{{ user.name }}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div
              v-if="activeUsers.length > 4"
              class="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium ring-2 ring-background"
            >
              +{{ activeUsers.length - 4 }}
            </div>
          </div>
          <span class="ml-1 text-xs text-muted-foreground">{{ activeUsers.length }} online</span>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-2">
          <Button variant="ghost" size="sm" class="hidden gap-1.5 text-muted-foreground sm:flex">
            <MessageSquare class="size-4" />
            <span>{{ workspace.comments }}</span>
          </Button>
          <Button variant="outline" size="sm" @click="handleShare">
            <Share2 class="mr-1.5 size-4" />
            Share
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" class="size-8">
                <MoreHorizontal class="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-48">
              <DropdownMenuItem @click="handleFavorite">
                <Star class="size-4" />
                Add to favorites
              </DropdownMenuItem>
              <DropdownMenuItem @click="handleDuplicate">
                <Copy class="size-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem @click="handleHistory">
                <History class="size-4" />
                Version history
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="text-destructive" @click="handleDelete">
                <Trash2 class="size-4" />
                Delete workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative flex justify-center px-6 py-8 pb-10">
      <!-- Editor content -->
      <ClientOnly>
        <WorkspaceEditor v-model="content" />
      </ClientOnly>
    </div>

    <!-- Bottom Status Bar -->
    <div class="sticky right-0 bottom-0 left-0 z-20">
      <div class="mx-auto max-w-4xl px-6">
        <div
          class="flex items-center gap-4 rounded-t-xl border border-b-0 border-border/50 bg-card/95 px-4 py-2 shadow-lg backdrop-blur-xl"
        >
          <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div class="size-2 animate-pulse rounded-full bg-emerald-500" />
            <span>Saved</span>
          </div>
          <Separator orientation="vertical" class="h-4" />
          <span class="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Type class="size-3" />
            {{ documentInfo.wordCount }} words
          </span>
          <span class="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock class="size-3" />
            {{ documentInfo.readingTime }} read
          </span>
          <div class="flex-1" />
          <span class="text-xs text-muted-foreground">{{ workspace.createdAt }}</span>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import Intro from "@/assets/intro/workspace.txt?raw";
import {
  FileText,
  Edit3,
  MessageCircle,
  MessageSquare,
  Image,
  Link,
  Globe,
  Lock,
  Share2,
  MoreHorizontal,
  Star,
  Copy,
  History,
  Trash2,
  UserPlus,
  Users,
  Type,
  Clock,
  PanelRight,
  PanelRightClose,
  Activity,
  Pencil,
  Eye
} from "lucide-vue-next";
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
const showSidebar = ref(true);

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
