<template>
  <Card class="relative p-0 overflow-hidden gap-0 group">
    <div class="w-full -space-y-8">
      <WidgetsImagePoster :src="community.posterImage" :alt="community.name" size="md" />
      <Avatar class="size-16 ml-4 bg-foreground rounded-md">
        <AvatarImage :src="community.iconImage" :alt="community.name" />
        <AvatarFallback>{{ community.name.charAt(0) }}</AvatarFallback>
      </Avatar>
    </div>

    <!-- Content -->
    <div class="p-4 space-y-1">
      <div class="flex items-center gap-1">
        <Tooltip v-if="community.totalUsers > 20000">
          <TooltipTrigger>
            <BadgeCheck class="size-5 text-green-500" />
          </TooltipTrigger>
          <TooltipContent>Verified Community</TooltipContent>
        </Tooltip>
        <h2 class="text-lg font-medium">
          {{ community.name }}
        </h2>
        <!-- Category badge -->
        <Badge :class="getCategoryBadgeClass(community.type)" class="ml-2">
          <component :is="getCategoryIcon(community.type)" class="size-3" />
          {{ community.type }}
        </Badge>
      </div>

      <!-- Description -->
      <p class="text-sm text-muted-foreground line-clamp-2">
        {{ community.description }}
      </p>

      <Separator class="my-4" />

      <!-- Actions -->
      <div class="w-full grid grid-cols-2 items-center gap-4">
        <Dialog v-model:open="joinDialogOpen">
          <DialogTrigger asChild class="gap-1">
            <Button class="w-full"><CirclePlus /> Join Now </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-md">
            <DialogHeader>
              <DialogTitle class="flex items-center gap-2">
                <Avatar class="size-10 rounded-md">
                  <AvatarImage :src="community.iconImage" :alt="community.name" />
                  <AvatarFallback>{{ community.name.charAt(0) }}</AvatarFallback>
                </Avatar>
                <div>
                  <span>{{
                    community.requiresApproval ? "Request to Join" : "Join Community"
                  }}</span>
                  <p class="text-sm font-normal text-muted-foreground">{{ community.name }}</p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <!-- Requires Approval -->
            <div v-if="community.requiresApproval" class="space-y-4 py-4">
              <div
                class="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
              >
                <ShieldAlert class="size-5 text-amber-500 shrink-0 mt-0.5" />
                <div class="space-y-1">
                  <p class="text-sm font-medium">Admin Approval Required</p>
                  <p class="text-xs text-muted-foreground">
                    This community requires admin approval before you can join. Your request will be
                    reviewed by the community moderators.
                  </p>
                </div>
              </div>

              <div class="space-y-2">
                <Label>Why do you want to join? (Optional)</Label>
                <Textarea
                  v-model="joinReason"
                  placeholder="Tell the admins a bit about yourself and why you'd like to join..."
                  class="resize-none"
                  :rows="3"
                />
              </div>

              <div class="flex items-center space-x-2">
                <Checkbox id="agree-rules" v-model:checked="agreedToRules" />
                <Label for="agree-rules" class="text-sm cursor-pointer">
                  I agree to follow the community rules and guidelines
                </Label>
              </div>
            </div>

            <!-- Direct Join -->
            <div v-else class="space-y-3 py-4">
              <div
                class="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
              >
                <UserCheck class="size-5 text-green-500 shrink-0 mt-0.5" />
                <div class="space-y-1">
                  <p class="text-sm font-medium">Open Community</p>
                  <p class="text-xs text-muted-foreground">
                    You can join this community immediately and start participating right away.
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-4 p-3 rounded-lg bg-muted">
                <Users class="size-5 text-muted-foreground" />
                <div class="flex-1">
                  <p class="text-sm font-medium">
                    {{ formatNumber(community.totalUsers) }} members
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ formatNumber(getOnlineCount(community.totalUsers)) }} online now
                  </p>
                </div>
              </div>

              <p class="text-sm text-center text-muted-foreground">
                Are you sure you want to join
                <span class="font-medium text-foreground">{{ community.name }}</span
                >?
              </p>
            </div>

            <DialogFooter class="gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button @click="handleJoin" :disabled="community.requiresApproval && !agreedToRules">
                <template v-if="community.requiresApproval">
                  <Send class="size-4" />
                  Send Request
                </template>
                <template v-else>
                  <Check class="size-4" />
                  Join Community
                </template>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div class="flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <!-- Member avatars preview -->
          <div class="flex -space-x-2">
            <Avatar
              v-for="i in 5"
              :key="i"
              class="size-7 border-2 border-card ring-0 transition-transform hover:scale-110 hover:z-10"
            >
              <AvatarImage :src="`/images/avatar/${i}.png`" />
            </Avatar>
            <div
              class="size-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium border-2 border-card z-2"
            >
              +{{ Math.floor(community.totalUsers / 1000) }}k
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="size-2 rounded-full bg-green-500 animate-pulse" />
            <span>{{ formatNumber(getOnlineCount(community.totalUsers)) }} online</span>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import {
  CirclePlus,
  BadgeCheck,
  Gamepad2,
  Code2,
  BookOpen,
  Smile,
  Briefcase,
  Palette,
  MessageCircle,
  Coins,
  ShieldAlert,
  UserCheck,
  Users,
  Send,
  Check,
  Music
} from "lucide-vue-next";

interface Community {
  id: string;
  name: string;
  description: string;
  totalUsers: number;
  posterImage: string;
  iconImage: string;
  type: string;
  requiresApproval?: boolean;
}

const props = defineProps<{
  community: Community;
}>();

const emit = defineEmits<{
  join: [community: Community];
  requestJoin: [payload: { community: Community; reason: string }];
}>();

const joinDialogOpen = ref(false);
const joinReason = ref("");
const agreedToRules = ref(false);

const handleJoin = () => {
  if (props.community.requiresApproval) {
    emit("requestJoin", {
      community: props.community,
      reason: joinReason.value
    });
  } else {
    emit("join", props.community);
  }
  joinDialogOpen.value = false;
  joinReason.value = "";
  agreedToRules.value = false;
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const getOnlineCount = (total: number) => {
  return Math.floor(total * (0.05 + Math.random() * 0.15));
};

type CategoryType =
  | "gaming"
  | "tech"
  | "study"
  | "fun"
  | "business"
  | "design"
  | "discussion"
  | "finance"
  | "art"
  | "music";

const getCategoryIcon = (type: string) => {
  const icons: Record<CategoryType, typeof Gamepad2> = {
    gaming: Gamepad2,
    tech: Code2,
    study: BookOpen,
    fun: Smile,
    business: Briefcase,
    design: Palette,
    discussion: MessageCircle,
    finance: Coins,
    art: Palette,
    music: Music
  };
  return icons[type as CategoryType] || MessageCircle;
};

const getCategoryBadgeClass = (type: string) => {
  const classes: Record<CategoryType, string> = {
    gaming: "bg-purple-500 text-purple-100",
    tech: "bg-blue-500 text-blue-100",
    study: "bg-amber-500 text-amber-100",
    fun: "bg-pink-500 text-pink-100",
    business: "bg-emerald-500 text-emerald-100",
    design: "bg-rose-500 text-rose-100",
    discussion: "bg-cyan-500 text-cyan-100",
    finance: "bg-yellow-500 text-yellow-100",
    art: "bg-rose-500 text-rose-100",
    music: "bg-indigo-500 text-indigo-100"
  };
  return classes[type as CategoryType] || "bg-gray-500/20 text-gray-300";
};
</script>
