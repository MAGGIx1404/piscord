<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">Privacy & final settings</h2>
      <p class="text-muted-foreground">Configure who can see and join your community.</p>
    </div>

    <!-- Visibility -->
    <div class="grid gap-4 md:grid-cols-2">
      <button
        @click="$emit('update:visibility', 'public')"
        class="relative rounded-2xl border-2 p-6 text-left transition-all duration-300"
        :class="[
          visibility === 'public'
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-border hover:border-emerald-500/50'
        ]"
      >
        <div
          v-if="visibility === 'public'"
          class="absolute top-4 right-4 flex size-6 items-center justify-center rounded-full bg-emerald-500"
        >
          <Check class="size-4 text-white" />
        </div>
        <div class="mb-4 flex size-12 items-center justify-center rounded-xl bg-emerald-500/20">
          <Globe class="size-6 text-emerald-500" />
        </div>
        <h3 class="mb-1 text-lg font-semibold">Public</h3>
        <p class="text-sm text-muted-foreground">Anyone can discover and join freely</p>
      </button>

      <button
        @click="$emit('update:visibility', 'private')"
        class="relative rounded-2xl border-2 p-6 text-left transition-all duration-300"
        :class="[
          visibility === 'private'
            ? 'border-amber-500 bg-amber-500/10'
            : 'border-border hover:border-amber-500/50'
        ]"
      >
        <div
          v-if="visibility === 'private'"
          class="absolute top-4 right-4 flex size-6 items-center justify-center rounded-full bg-amber-500"
        >
          <Check class="size-4 text-white" />
        </div>
        <div class="mb-4 flex size-12 items-center justify-center rounded-xl bg-amber-500/20">
          <Lock class="size-6 text-amber-500" />
        </div>
        <h3 class="mb-1 text-lg font-semibold">Private</h3>
        <p class="text-sm text-muted-foreground">Only invited members can access</p>
      </button>
    </div>

    <!-- Additional Settings -->
    <div class="space-y-1 divide-y divide-border/50 rounded-2xl border border-border/50 bg-card/50">
      <div class="flex items-center justify-between p-5">
        <div class="flex items-center gap-4">
          <div class="flex size-10 items-center justify-center rounded-xl bg-muted">
            <UserCheck class="size-5 text-muted-foreground" />
          </div>
          <div>
            <p class="font-medium">Require Approval</p>
            <p class="text-sm text-muted-foreground">New members need admin approval</p>
          </div>
        </div>
        <Switch v-on:update:model-value="requireApproval = $event" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Globe, Lock, Check, UserCheck } from "lucide-vue-next";

defineEmits<{
  "update:visibility": [value: "public" | "private"];
}>();

const visibility = defineModel<"public" | "private">("visibility", {
  default: "public"
});

const requireApproval = defineModel<boolean>("requireApproval", {
  default: false
});
</script>
