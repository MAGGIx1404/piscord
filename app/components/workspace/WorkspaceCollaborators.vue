<template>
  <Card class="gap-4">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold flex items-center gap-2">
        <Users class="size-4" />
        Collaborators
      </h3>
      <Button variant="ghost" size="icon" class="size-7" @click="$emit('add')">
        <UserPlus class="size-3" />
      </Button>
    </div>
    <div class="space-y-1">
      <div
        v-for="user in collaborators"
        :key="user.id"
        class="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
        @click="$emit('select', user)"
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
</template>

<script setup lang="ts">
import { Users, UserPlus, Pencil } from "lucide-vue-next";

interface Collaborator {
  id: string | number;
  name: string;
  avatar: string;
  initials: string;
  role: string;
  isOnline?: boolean;
  isEditing?: boolean;
}

interface Props {
  collaborators: Collaborator[];
}

defineProps<Props>();

defineEmits<{
  add: [];
  select: [user: Collaborator];
}>();
</script>
