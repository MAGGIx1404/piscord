<template>
  <div class="p-5 rounded-2xl bg-card/50 border border-border/50 space-y-4">
    <div class="flex items-center gap-2">
      <span class="relative flex size-2">
        <span
          class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"
        />
        <span class="relative inline-flex rounded-full size-2 bg-green-500" />
      </span>
      <h3 class="text-sm font-medium">Online Now</h3>
      <span class="text-xs text-muted-foreground">{{ onlineMembers.length }}</span>
    </div>
    <div class="flex flex-wrap gap-1">
      <Avatar
        v-for="member in onlineMembers.slice(0, maxDisplay)"
        :key="member.id"
        class="size-9 ring-2 ring-background -ml-1 first:ml-0 hover:z-10 hover:scale-110 transition-transform cursor-pointer"
        @click="$emit('selectMember', member)"
      >
        <AvatarImage :src="member.avatar" />
        <AvatarFallback>{{ member.name.charAt(0) }}</AvatarFallback>
      </Avatar>
      <div
        v-if="onlineMembers.length > maxDisplay"
        class="size-9 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground -ml-1"
      >
        +{{ onlineMembers.length - maxDisplay }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Member {
  id: string | number;
  name: string;
  avatar: string;
}

interface Props {
  onlineMembers: Member[];
  maxDisplay?: number;
}

withDefaults(defineProps<Props>(), {
  maxDisplay: 8
});

defineEmits<{
  selectMember: [member: Member];
}>();
</script>
