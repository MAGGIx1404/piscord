<template>
  <Card class="p-6">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Shield class="size-5" />
        Privacy & Settings
      </CardTitle>
      <CardDescription> Control who can see and join your community. </CardDescription>
    </CardHeader>

    <CardContent class="space-y-6">
      <!-- Visibility -->
      <div class="space-y-3">
        <Label>Community Visibility</Label>
        <div class="grid grid-cols-2 gap-4">
          <!-- Public Option -->
          <div
            class="relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 group"
            :class="[
              visibility === 'public'
                ? 'border-green-500 bg-green-500/10'
                : 'border-input hover:border-green-500/50 hover:bg-green-500/5'
            ]"
            @click="$emit('update:visibility', 'public')"
          >
            <div v-if="visibility === 'public'" class="absolute top-3 right-3">
              <div class="size-5 rounded-full bg-green-500 flex items-center justify-center">
                <Check class="size-3 text-white" />
              </div>
            </div>
            <div
              class="size-12 rounded-xl flex items-center justify-center mb-3 transition-colors"
              :class="
                visibility === 'public' ? 'bg-green-500/20' : 'bg-muted group-hover:bg-green-500/10'
              "
            >
              <Globe
                class="size-6 transition-colors"
                :class="
                  visibility === 'public'
                    ? 'text-green-500'
                    : 'text-muted-foreground group-hover:text-green-500'
                "
              />
            </div>
            <h4 class="font-semibold mb-1">Public</h4>
            <p class="text-xs text-muted-foreground">
              Anyone can discover and join your community freely.
            </p>
          </div>

          <!-- Private Option -->
          <div
            class="relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 group"
            :class="[
              visibility === 'private'
                ? 'border-red-500 bg-red-500/10'
                : 'border-input hover:border-red-500/50 hover:bg-red-500/5'
            ]"
            @click="$emit('update:visibility', 'private')"
          >
            <div v-if="visibility === 'private'" class="absolute top-3 right-3">
              <div class="size-5 rounded-full bg-red-500 flex items-center justify-center">
                <Check class="size-3 text-white" />
              </div>
            </div>
            <div
              class="size-12 rounded-xl flex items-center justify-center mb-3 transition-colors"
              :class="
                visibility === 'private' ? 'bg-red-500/20' : 'bg-muted group-hover:bg-red-500/10'
              "
            >
              <Lock
                class="size-6 transition-colors"
                :class="
                  visibility === 'private'
                    ? 'text-red-500'
                    : 'text-muted-foreground group-hover:text-red-500'
                "
              />
            </div>
            <h4 class="font-semibold mb-1">Private</h4>
            <p class="text-xs text-muted-foreground">
              Only invited members can access your community.
            </p>
          </div>
        </div>
      </div>

      <!-- Additional Settings -->
      <Separator />

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <Label class="flex items-center gap-2">
              <UserCheck class="size-4" />
              Require Approval
            </Label>
            <p class="text-sm text-muted-foreground">New members need admin approval to join.</p>
          </div>
          <Switch
            :checked="requireApproval"
            @update:checked="$emit('update:requireApproval', $event)"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <Label class="flex items-center gap-2">
              <MessageSquare class="size-4" />
              Enable Welcome Message
            </Label>
            <p class="text-sm text-muted-foreground">Send a welcome message to new members.</p>
          </div>
          <Switch
            :checked="enableWelcome"
            @update:checked="$emit('update:enableWelcome', $event)"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <Label class="flex items-center gap-2">
              <Bell class="size-4" />
              Discoverable
            </Label>
            <p class="text-sm text-muted-foreground">
              Show community in search results and discovery.
            </p>
          </div>
          <Switch :checked="discoverable" @update:checked="$emit('update:discoverable', $event)" />
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Shield, Globe, Lock, Check, UserCheck, MessageSquare, Bell } from "lucide-vue-next";

interface Props {
  visibility: "public" | "private";
  requireApproval: boolean;
  enableWelcome: boolean;
  discoverable: boolean;
}

defineProps<Props>();

defineEmits<{
  "update:visibility": [value: "public" | "private"];
  "update:requireApproval": [value: boolean];
  "update:enableWelcome": [value: boolean];
  "update:discoverable": [value: boolean];
}>();
</script>
