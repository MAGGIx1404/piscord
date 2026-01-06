<template>
  <div class="space-y-3">
    <Button class="w-full" size="lg" :disabled="!isValid" @click="$emit('create')">
      <Rocket class="size-5 mr-2" />
      Create Community
    </Button>
    <Button variant="outline" class="w-full" @click="$emit('cancel')"> Cancel </Button>
    <p class="text-xs text-center text-muted-foreground">
      By creating a community, you agree to our
      <a href="#" class="text-primary hover:underline">Terms of Service</a>
      and
      <a href="#" class="text-primary hover:underline">Community Guidelines</a>.
    </p>
  </div>
</template>

<script setup lang="ts">
import { Rocket } from "lucide-vue-next";

interface Props {
  isValid: boolean;
}

defineProps<Props>();

defineEmits<{
  create: [];
  cancel: [];
}>();
</script>
