<template>
  <div class="flex items-center justify-between gap-4">
    <div class="min-w-0">
      <div class="flex items-center gap-1.5">
        <p class="text-sm font-medium">{{ label }}</p>
        <Badge v-if="locked" variant="secondary" class="h-4 px-1.5 text-[10px]"> Required </Badge>
      </div>
      <p v-if="description" class="text-xs text-muted-foreground">{{ description }}</p>
    </div>
    <Switch
      :model-value="modelValue"
      :disabled="locked"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  description?: string;
  modelValue: boolean;
  locked?: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
}>();
</script>
