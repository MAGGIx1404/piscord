<template>
  <div class="p-5 rounded-2xl bg-card/50 border border-border/50 space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Members</h3>
      <Button
        variant="ghost"
        size="sm"
        class="h-7 text-xs text-muted-foreground"
        @click="$emit('viewAll')"
      >
        View all
      </Button>
    </div>
    <div class="space-y-1">
      <button
        v-for="member in members"
        :key="member.id"
        class="w-full flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/30 transition-colors text-left"
        @click="$emit('selectMember', member)"
      >
        <div class="relative">
          <Avatar class="size-8">
            <AvatarImage :src="member.avatar" />
            <AvatarFallback>{{ member.name.charAt(0) }}</AvatarFallback>
          </Avatar>
          <span
            v-if="member.online"
            class="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full ring-2 ring-card"
          />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="text-sm font-medium truncate">{{ member.name }}</span>
            <Crown v-if="member.role === 'owner'" class="size-3 text-yellow-500 shrink-0" />
            <Shield v-else-if="member.role === 'admin'" class="size-3 text-red-500 shrink-0" />
            <Wrench v-else-if="member.role === 'mod'" class="size-3 text-blue-500 shrink-0" />
          </div>
          <p class="text-xs text-muted-foreground truncate">{{ member.status }}</p>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Crown, Shield, Wrench } from "lucide-vue-next";

interface Member {
  id: string | number;
  name: string;
  avatar: string;
  role: string;
  status: string;
  online: boolean;
}

interface Props {
  members: Member[];
}

defineProps<Props>();

defineEmits<{
  viewAll: [];
  selectMember: [member: Member];
}>();
</script>
