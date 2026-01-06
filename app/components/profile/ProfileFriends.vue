<template>
  <Card>
    <div class="flex items-center justify-between">
      <h3 class="font-semibold flex items-center gap-2">
        <Heart class="size-4" />
        Friends
      </h3>
      <Button variant="ghost" size="sm" class="text-xs" @click="$emit('viewAll')">
        View All
      </Button>
    </div>
    <div class="flex flex-wrap gap-2">
      <Tooltip v-for="friend in displayedFriends" :key="friend.id">
        <TooltipTrigger>
          <div class="relative cursor-pointer" @click="$emit('select', friend)">
            <Avatar class="size-10 hover:ring-2 hover:ring-primary transition-all">
              <AvatarImage :src="friend.avatar" />
              <AvatarFallback>{{ friend.name.charAt(0) }}</AvatarFallback>
            </Avatar>
            <span
              v-if="friend.online"
              class="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-card"
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
      <div
        v-if="remainingCount > 0"
        class="size-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium cursor-pointer hover:bg-muted/80 transition-colors"
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
