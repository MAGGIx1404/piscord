<template>
  <main class="w-full pb-10">
    <!-- Workspace Header -->
    <div class="w-full px-6 pt-6">
      <Card class="p-5">
        <div class="flex flex-col md:flex-row gap-5">
          <!-- Workspace Icon -->
          <div class="relative shrink-0">
            <div
              class="relative flex aspect-square size-20 items-center justify-center rounded-lg border bg-card ring-4 ring-card"
            >
              <FileText class="size-10 text-emerald-500" />
            </div>
          </div>

          <!-- Workspace Info -->
          <div class="flex-1 space-y-3">
            <div class="flex items-start justify-between flex-wrap gap-4">
              <div class="w-auto">
                <div class="flex items-center gap-2">
                  <h1 class="text-xl font-bold">{{ workspace.name }}</h1>
                  <Badge v-if="workspace.isPublic" variant="outline">
                    <Globe class="size-3" />
                    Public
                  </Badge>
                  <Badge v-else variant="outline">
                    <Lock class="size-3" />
                    Private
                  </Badge>
                </div>
                <p class="text-sm text-muted-foreground">
                  Created {{ workspace.createdAt }} • Last edited {{ workspace.lastEdited }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <!-- Active Users Avatars -->
                <div class="flex items-center -space-x-2 mr-2">
                  <Tooltip v-for="user in activeUsers.slice(0, 4)" :key="user.id">
                    <TooltipTrigger>
                      <Avatar
                        class="size-8 ring-2 ring-card hover:ring-primary transition-all hover:z-10"
                      >
                        <AvatarImage :src="user.avatar" />
                        <AvatarFallback class="text-xs">{{ user.initials }}</AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p class="text-xs">{{ user.name }}</p>
                    </TooltipContent>
                  </Tooltip>
                  <div
                    v-if="activeUsers.length > 4"
                    class="flex items-center justify-center size-8 rounded-full bg-muted ring-2 ring-card text-xs font-medium z-3"
                  >
                    +{{ activeUsers.length - 4 }}
                  </div>
                </div>

                <Button variant="outline" size="sm">
                  <Share2 class="size-4" />
                  Share
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" class="size-8">
                      <MoreHorizontal class="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Star class="size-4" />
                      Add to favorites
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy class="size-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <History class="size-4" />
                      Version history
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="text-destructive">
                      <Trash2 class="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <!-- Collaborators & Stats -->
            <div class="flex flex-wrap items-center gap-4">
              <Button variant="link" size="link" class="text-muted-foreground">
                <Users class="size-4 text-emerald-500" />
                {{ workspace.collaborators }} collaborators
              </Button>
              <Button variant="link" size="link" class="text-muted-foreground">
                <Eye class="size-4 text-blue-500" />
                {{ workspace.views }} views
              </Button>
              <Button variant="link" size="link" class="text-muted-foreground">
                <MessageSquare class="size-4 text-purple-500" />
                {{ workspace.comments }} comments
              </Button>
              <Separator orientation="vertical" class="min-h-4" />
              <span class="text-sm text-muted-foreground">
                <Type class="size-4 inline-block mr-1 text-orange-500" />
                {{ documentInfo.wordCount }} words
              </span>
              <span class="text-sm text-muted-foreground">
                <Clock class="size-4 inline-block mr-1 text-cyan-500" />
                {{ documentInfo.readingTime }} read
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Main Content Grid -->
    <div class="w-full mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6 px-6">
      <!-- Editor (Main Content) -->
      <div class="lg:col-span-3">
        <ClientOnly>
          <CommunityWorkspaceEditor v-model="content" />
        </ClientOnly>
      </div>

      <!-- Right Sidebar -->
      <div class="space-y-6 sticky top-16 h-max">
        <!-- Collaborators Card -->
        <Card class="gap-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold flex items-center gap-2">
              <Users class="size-4" />
              Collaborators
            </h3>
            <Button variant="ghost" size="icon" class="size-7">
              <UserPlus class="size-3" />
            </Button>
          </div>
          <div class="space-y-1">
            <div
              v-for="user in collaborators"
              :key="user.id"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div class="relative">
                <Avatar class="size-9">
                  <AvatarImage :src="user.avatar" />
                  <AvatarFallback class="text-sm">{{ user.initials }}</AvatarFallback>
                </Avatar>
                <span
                  v-if="user.isOnline"
                  class="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full ring-2 ring-card"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{{ user.name }}</p>
                <p class="text-xs text-muted-foreground">{{ user.role }}</p>
              </div>
              <Badge v-if="user.isEditing" variant="outline" class="text-xs">
                <Pencil class="size-3" />
                Editing
              </Badge>
            </div>
          </div>
        </Card>

        <!-- Activity Card -->
        <Card class="gap-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold flex items-center gap-2">
              <Activity class="size-4" />
              Recent Activity
            </h3>
            <Button variant="ghost" size="sm" class="h-7 text-xs">View all</Button>
          </div>
          <div class="space-y-4">
            <div v-for="activity in activities" :key="activity.id" class="flex items-start gap-3">
              <Avatar class="size-7 mt-0.5">
                <AvatarImage :src="activity.user.avatar" />
                <AvatarFallback class="text-xs">{{ activity.user.initials }}</AvatarFallback>
              </Avatar>
              <div class="flex-1 min-w-0">
                <p class="text-sm">
                  <span class="font-medium">{{ activity.user.name }}</span>
                  <span class="text-muted-foreground"> {{ activity.action }}</span>
                </p>
                <p class="text-xs text-muted-foreground">{{ activity.time }}</p>
              </div>
              <component :is="activity.icon" class="size-4 text-muted-foreground mt-0.5" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import Intro from "@/assets/intro/workspace.txt?raw";
import {
  FileText,
  Globe,
  Lock,
  Share2,
  MoreHorizontal,
  Star,
  Copy,
  History,
  Trash2,
  Users,
  Eye,
  MessageSquare,
  UserPlus,
  Pencil,
  Activity,
  Edit3,
  MessageCircle,
  Image,
  Link,
  Type,
  Clock
} from "lucide-vue-next";

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

const activeUsers = ref([
  { id: 1, name: "Sarah Chen", avatar: "/images/avatar/1.png", initials: "SC" },
  { id: 2, name: "Alex Rivera", avatar: "/images/avatar/2.png", initials: "AR" },
  { id: 3, name: "Mike Johnson", avatar: "/images/avatar/3.png", initials: "MJ" },
  { id: 4, name: "Emily Davis", avatar: "/images/avatar/4.png", initials: "ED" },
  { id: 5, name: "Chris Lee", avatar: "/images/avatar/5.png", initials: "CL" }
]);

const collaborators = ref([
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

const activities = ref([
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
</script>
