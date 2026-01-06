<template>
  <Card>
    <div class="flex items-center justify-between">
      <h3 class="font-semibold flex items-center gap-2">
        <Users class="size-4" />
        Communities
      </h3>
      <Button variant="ghost" size="sm" @click="$emit('viewAll')">View All</Button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="community in communities"
        :key="community.id"
        class="flex items-center gap-4 p-4 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer"
        @click="$emit('select', community)"
      >
        <Avatar class="size-12 bg-foreground rounded-md">
          <AvatarImage :src="community.icon" />
          <AvatarFallback>{{ community.name.charAt(0) }}</AvatarFallback>
        </Avatar>
        <div class="flex-1 min-w-0">
          <h4 class="font-medium truncate">{{ community.name }}</h4>
          <p class="text-xs text-muted-foreground">{{ community.members }} members</p>
        </div>
        <Badge :class="getRoleBadgeClass(community.role)">
          {{ community.role }}
        </Badge>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Users } from "lucide-vue-next";

interface Community {
  id: string | number;
  name: string;
  icon: string;
  members: string | number;
  role: string;
}

interface Props {
  communities: Community[];
}

defineProps<Props>();

defineEmits<{
  viewAll: [];
  select: [community: Community];
}>();

function getRoleBadgeClass(role: string): string {
  switch (role) {
    case "Admin":
      return "bg-red-500 text-primary";
    case "Mod":
      return "bg-blue-500 text-primary";
    default:
      return "bg-green-500 text-primary";
  }
}
</script>
