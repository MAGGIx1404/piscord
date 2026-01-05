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
        <Button class="w-full"><CirclePlus /> Join Now </Button>

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

<script setup>
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
  Coins
} from "lucide-vue-next";

defineProps({
  community: {
    type: Object,
    required: true
  }
});

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const getOnlineCount = (total) => {
  return Math.floor(total * (0.05 + Math.random() * 0.15));
};

const getCategoryIcon = (type) => {
  const icons = {
    gaming: Gamepad2,
    tech: Code2,
    study: BookOpen,
    fun: Smile,
    business: Briefcase,
    design: Palette,
    discussion: MessageCircle,
    finance: Coins
  };
  return icons[type] || MessageCircle;
};

const getCategoryBadgeClass = (type) => {
  const classes = {
    gaming: "bg-purple-500 text-purple-100",
    tech: "bg-blue-500 text-blue-100",
    study: "bg-amber-500 text-amber-100",
    fun: "bg-pink-500 text-pink-100",
    business: "bg-emerald-500 text-emerald-100",
    design: "bg-rose-500 text-rose-100",
    discussion: "bg-cyan-500 text-cyan-100",
    finance: "bg-yellow-500 text-yellow-100"
  };
  return classes[type] || "bg-gray-500/20 text-gray-300";
};
</script>
