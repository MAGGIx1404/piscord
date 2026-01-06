<template>
  <Card>
    <div class="flex items-center justify-between">
      <h3 class="font-semibold flex items-center gap-2">
        <Users class="size-4" />
        Members
      </h3>
      <Button variant="ghost" size="sm" @click="$emit('viewAll')">View All</Button>
    </div>

    <!-- Role Tabs -->
    <Tabs v-model="selectedRoleModel" class="w-full">
      <TabsList>
        <TabsTrigger v-for="role in roles" :key="role.id" :value="role.id" class="max-w-max px-4">
          <span class="size-2 rounded-full" :class="role.dotColor" />
          {{ role.label }}
        </TabsTrigger>
      </TabsList>

      <TabsContent :value="selectedRoleModel" class="mt-4">
        <!-- Members Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="member in filteredMembers"
            :key="member.id"
            class="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer"
            @click="$emit('selectMember', member)"
          >
            <div class="relative">
              <Avatar class="size-10">
                <AvatarImage :src="member.avatar" />
                <AvatarFallback>{{ member.name.charAt(0) }}</AvatarFallback>
              </Avatar>
              <span
                v-if="member.online"
                class="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-card"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="font-medium text-sm truncate">{{ member.name }}</p>
                <Crown v-if="member.role === 'owner'" class="size-3 text-yellow-500" />
                <Shield v-else-if="member.role === 'admin'" class="size-3 text-red-500" />
                <Wrench v-else-if="member.role === 'mod'" class="size-3 text-blue-500" />
              </div>
              <p class="text-xs text-muted-foreground">{{ member.status }}</p>
            </div>
            <Badge :class="getRoleBadgeClass(member.role)" class="text-xs">
              {{ member.role }}
            </Badge>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  </Card>
</template>

<script setup lang="ts">
import { Users, Crown, Shield, Wrench } from "lucide-vue-next";
import { computed } from "vue";

interface Role {
  id: string;
  label: string;
  count: number;
  dotColor: string;
}

interface Member {
  id: number | string;
  name: string;
  avatar: string;
  role: string;
  status: string;
  online: boolean;
}

interface Props {
  roles: Role[];
  members: Member[];
  selectedRole?: string;
}

const props = withDefaults(defineProps<Props>(), {
  selectedRole: "all"
});

const emit = defineEmits<{
  "update:selectedRole": [value: string];
  viewAll: [];
  selectMember: [member: Member];
}>();

const selectedRoleModel = computed({
  get: () => props.selectedRole,
  set: (value) => emit("update:selectedRole", value)
});

const filteredMembers = computed(() => {
  if (selectedRoleModel.value === "all") return props.members;
  return props.members.filter((m) => m.role === selectedRoleModel.value);
});

const getRoleBadgeClass = (role: string) => {
  const classes: Record<string, string> = {
    owner: "bg-yellow-500 text-white",
    admin: "bg-red-500 text-white",
    mod: "bg-blue-500 text-white",
    member: "bg-green-500/20 text-green-500"
  };
  return classes[role] || "bg-muted";
};
</script>
