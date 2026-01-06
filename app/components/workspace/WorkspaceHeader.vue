<template>
  <Card class="p-5">
    <div class="flex flex-col md:flex-row gap-5">
      <!-- Workspace Icon -->
      <div class="relative shrink-0">
        <div
          class="relative flex aspect-square size-20 items-center justify-center rounded-lg border bg-card ring-4 ring-card"
        >
          <component :is="icon" class="size-10" :class="iconClass" />
        </div>
      </div>

      <!-- Workspace Info -->
      <div class="flex-1 space-y-3">
        <div class="flex items-start justify-between flex-wrap gap-4">
          <div class="w-auto">
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold">{{ name }}</h1>
              <Badge v-if="isPublic" variant="outline">
                <Globe class="size-3" />
                Public
              </Badge>
              <Badge v-else variant="outline">
                <Lock class="size-3" />
                Private
              </Badge>
              <slot name="badges" />
            </div>
            <p class="text-sm text-muted-foreground">
              Created {{ createdAt }}
              <span v-if="lastEdited"> • Last edited {{ lastEdited }}</span>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <!-- Active Users Avatars -->
            <div v-if="activeUsers.length" class="flex items-center -space-x-2 mr-2">
              <Tooltip v-for="user in displayedActiveUsers" :key="user.id">
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
                v-if="activeUsers.length > maxActiveUsers"
                class="flex items-center justify-center size-8 rounded-full bg-muted ring-2 ring-card text-xs font-medium z-3"
              >
                +{{ activeUsers.length - maxActiveUsers }}
              </div>
            </div>

            <slot name="actions">
              <Button variant="outline" size="sm" @click="$emit('share')">
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
                  <DropdownMenuItem @click="$emit('favorite')">
                    <Star class="size-4" />
                    Add to favorites
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('duplicate')">
                    <Copy class="size-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('history')">
                    <History class="size-4" />
                    Version history
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem class="text-destructive" @click="$emit('delete')">
                    <Trash2 class="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </slot>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="flex flex-wrap items-center gap-4">
          <Button
            v-if="collaboratorsCount !== undefined"
            variant="link"
            size="link"
            class="text-muted-foreground"
          >
            <Users class="size-4 text-emerald-500" />
            {{ collaboratorsCount }} collaborators
          </Button>
          <Button
            v-if="viewsCount !== undefined"
            variant="link"
            size="link"
            class="text-muted-foreground"
          >
            <Eye class="size-4 text-blue-500" />
            {{ viewsCount }} views
          </Button>
          <Button
            v-if="commentsCount !== undefined"
            variant="link"
            size="link"
            class="text-muted-foreground"
          >
            <MessageSquare class="size-4 text-purple-500" />
            {{ commentsCount }} comments
          </Button>
          <template v-if="wordCount || readingTime">
            <Separator orientation="vertical" class="min-h-4" />
            <span v-if="wordCount" class="text-sm text-muted-foreground">
              <Type class="size-4 inline-block mr-1 text-orange-500" />
              {{ wordCount }} words
            </span>
            <span v-if="readingTime" class="text-sm text-muted-foreground">
              <Clock class="size-4 inline-block mr-1 text-cyan-500" />
              {{ readingTime }} read
            </span>
          </template>
          <slot name="stats" />
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import {
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
  FileText,
  Type,
  Clock
} from "lucide-vue-next";
import { computed, type Component } from "vue";

interface ActiveUser {
  id: string | number;
  name: string;
  avatar: string;
  initials: string;
}

interface Props {
  name: string;
  icon?: Component;
  iconClass?: string;
  isPublic?: boolean;
  createdAt?: string;
  lastEdited?: string;
  activeUsers?: ActiveUser[];
  maxActiveUsers?: number;
  collaboratorsCount?: number | string;
  viewsCount?: number | string;
  commentsCount?: number | string;
  wordCount?: string;
  readingTime?: string;
}

const props = withDefaults(defineProps<Props>(), {
  icon: () => FileText,
  iconClass: "text-emerald-500",
  isPublic: true,
  createdAt: "",
  lastEdited: "",
  activeUsers: () => [],
  maxActiveUsers: 4,
  collaboratorsCount: undefined,
  viewsCount: undefined,
  commentsCount: undefined,
  wordCount: "",
  readingTime: ""
});

defineEmits<{
  share: [];
  favorite: [];
  duplicate: [];
  history: [];
  delete: [];
}>();

const displayedActiveUsers = computed(() => props.activeUsers.slice(0, props.maxActiveUsers));
</script>
