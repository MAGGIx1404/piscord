<template>
  <div class="p-5 rounded-2xl bg-card/50 border border-border/50 space-y-4">
    <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Roles</h3>
    <div class="space-y-2">
      <button
        v-for="role in roles"
        :key="role.id"
        class="w-full flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/30 transition-colors text-left"
        :class="selectedRole === role.id ? 'bg-muted/50' : ''"
        @click="$emit('update:selectedRole', role.id)"
      >
        <span class="size-2 rounded-full" :class="role.dotColor" />
        <span class="flex-1 text-sm">{{ role.label }}</span>
        <span class="text-xs text-muted-foreground tabular-nums">{{
          role.count.toLocaleString()
        }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Role {
  id: string;
  label: string;
  count: number;
  dotColor: string;
}

interface Props {
  roles: Role[];
  selectedRole?: string;
}

withDefaults(defineProps<Props>(), {
  selectedRole: "all"
});

defineEmits<{
  "update:selectedRole": [roleId: string];
}>();
</script>
