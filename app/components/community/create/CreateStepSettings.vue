<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">Privacy & final settings</h2>
      <p class="text-muted-foreground">Configure who can see and join your community.</p>
    </div>

    <!-- Visibility -->
    <div class="grid md:grid-cols-2 gap-4">
      <button
        @click="$emit('update:visibility', 'public')"
        class="relative p-6 rounded-2xl border-2 transition-all duration-300 text-left"
        :class="[
          visibility === 'public'
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-border hover:border-emerald-500/50'
        ]"
      >
        <div
          v-if="visibility === 'public'"
          class="absolute top-4 right-4 size-6 rounded-full bg-emerald-500 flex items-center justify-center"
        >
          <Check class="size-4 text-white" />
        </div>
        <div class="size-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
          <Globe class="size-6 text-emerald-500" />
        </div>
        <h3 class="font-semibold text-lg mb-1">Public</h3>
        <p class="text-sm text-muted-foreground">Anyone can discover and join freely</p>
      </button>

      <button
        @click="$emit('update:visibility', 'private')"
        class="relative p-6 rounded-2xl border-2 transition-all duration-300 text-left"
        :class="[
          visibility === 'private'
            ? 'border-amber-500 bg-amber-500/10'
            : 'border-border hover:border-amber-500/50'
        ]"
      >
        <div
          v-if="visibility === 'private'"
          class="absolute top-4 right-4 size-6 rounded-full bg-amber-500 flex items-center justify-center"
        >
          <Check class="size-4 text-white" />
        </div>
        <div class="size-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
          <Lock class="size-6 text-amber-500" />
        </div>
        <h3 class="font-semibold text-lg mb-1">Private</h3>
        <p class="text-sm text-muted-foreground">Only invited members can access</p>
      </button>
    </div>

    <!-- Additional Settings -->
    <div class="space-y-1 rounded-2xl bg-card/50 border border-border/50 divide-y divide-border/50">
      <div class="flex items-center justify-between p-5">
        <div class="flex items-center gap-4">
          <div class="size-10 rounded-xl bg-muted flex items-center justify-center">
            <UserCheck class="size-5 text-muted-foreground" />
          </div>
          <div>
            <p class="font-medium">Require Approval</p>
            <p class="text-sm text-muted-foreground">New members need admin approval</p>
          </div>
        </div>
        <Switch
          :checked="requireApproval"
          @update:checked="$emit('update:requireApproval', $event)"
        />
      </div>

      <div class="flex items-center justify-between p-5">
        <div class="flex items-center gap-4">
          <div class="size-10 rounded-xl bg-muted flex items-center justify-center">
            <MessageSquare class="size-5 text-muted-foreground" />
          </div>
          <div>
            <p class="font-medium">Welcome Message</p>
            <p class="text-sm text-muted-foreground">Send a message to new members</p>
          </div>
        </div>
        <Switch :checked="enableWelcome" @update:checked="$emit('update:enableWelcome', $event)" />
      </div>

      <div class="flex items-center justify-between p-5">
        <div class="flex items-center gap-4">
          <div class="size-10 rounded-xl bg-muted flex items-center justify-center">
            <Search class="size-5 text-muted-foreground" />
          </div>
          <div>
            <p class="font-medium">Discoverable</p>
            <p class="text-sm text-muted-foreground">Show in search and discovery</p>
          </div>
        </div>
        <Switch :checked="discoverable" @update:checked="$emit('update:discoverable', $event)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Globe, Lock, Check, UserCheck, MessageSquare, Search } from "lucide-vue-next";

defineProps<{
  visibility: "public" | "private";
  requireApproval: boolean;
  enableWelcome: boolean;
  discoverable: boolean;
}>();

defineEmits<{
  "update:visibility": [value: "public" | "private"];
  "update:requireApproval": [value: boolean];
  "update:enableWelcome": [value: boolean];
  "update:discoverable": [value: boolean];
}>();
</script>
