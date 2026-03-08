<template>
  <Card>
    <div class="flex items-center justify-between">
      <h3 class="flex items-center gap-2 font-semibold">
        <Heart class="size-4" />
        Friends
      </h3>
      <Button variant="ghost" size="sm" class="text-xs" @click="$emit('viewAll')">
        View All
      </Button>
    </div>
    <div class="flex flex-wrap gap-2">
      <TooltipProvider v-for="friend in displayedFriends" :key="friend.id">
        <Tooltip>
          <TooltipTrigger>
            <div class="relative cursor-pointer" @click="$emit('select', friend)">
              <Avatar class="size-10 transition-all hover:ring-2 hover:ring-primary">
                <AvatarImage :src="friend.avatar" />
                <AvatarFallback>{{ friend.name.charAt(0) }}</AvatarFallback>
              </Avatar>
              <span
                v-if="friend.online"
                class="absolute right-0 bottom-0 size-3 rounded-full border-2 border-card bg-green-500"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{{ friend.name }}</p>
            <p class="text-xs" :class="friend.online ? 'text-green-400' : 'text-muted-foreground'">
              {{ friend.online ? "Online" : "Offline" }}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div
        v-if="remainingCount > 0"
        class="flex size-10 cursor-pointer items-center justify-center rounded-full bg-muted text-xs font-medium transition-colors hover:bg-muted/80"
        @click="$emit('viewAll')"
      >
        +{{ remainingCount }}
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Heart } from "lucide-vue-next";
import { computed } from "vue";

interface Friend {
  id: string | number;
  name: string;
  avatar: string;
  online?: boolean;
}

interface Props {
  friends: Friend[];
  maxDisplay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  maxDisplay: 8
});

defineEmits<{
  viewAll: [];
  select: [friend: Friend];
}>();

const displayedFriends = computed(() => props.friends.slice(0, props.maxDisplay));
const remainingCount = computed(() => Math.max(0, props.friends.length - props.maxDisplay));
</script>
