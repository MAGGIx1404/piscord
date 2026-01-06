<template>
  <div class="w-full relative">
    <WidgetsImagePoster :src="bannerImage" size="lg" />

    <!-- Community Card Overlay -->
    <div class="w-full -mt-24 relative z-10 px-6">
      <Card class="p-6 backdrop-blur-xl bg-card/90 shadow-2xl">
        <div class="flex flex-col md:flex-row gap-6">
          <!-- Community Icon Section -->
          <div class="relative shrink-0">
            <div class="relative group">
              <div
                class="absolute -inset-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-500"
              />
              <div
                class="relative flex aspect-square size-32 items-center justify-center rounded-xl bg-card ring-4 ring-card"
              >
                <slot name="icon">
                  <component :is="icon" class="size-16 text-primary" />
                </slot>
              </div>
              <!-- Verified badge -->
              <span v-if="verified" class="absolute -top-2 -right-2 p-1.5 bg-blue-500 rounded-full">
                <BadgeCheck class="size-5 text-white" />
              </span>
            </div>
          </div>

          <!-- Community Info -->
          <div class="flex-1 space-y-4">
            <div class="flex items-start justify-between flex-wrap gap-4">
              <div class="w-auto">
                <div class="flex items-center gap-2">
                  <h1 class="text-2xl font-bold">{{ name }}</h1>
                  <Badge v-if="verified" class="bg-blue-500 text-white">
                    <Shield class="size-4" />
                    Verified
                  </Badge>
                  <Badge variant="outline">
                    {{ type }}
                  </Badge>
                </div>
                <p class="text-sm text-muted-foreground">
                  Created {{ createdAt }} • {{ memberCount }} members
                </p>
              </div>
              <div class="flex gap-2">
                <slot name="actions">
                  <Button variant="outline" size="sm" @click="$emit('settings')">
                    <Settings class="size-4" />
                    Settings
                  </Button>
                  <Button variant="outline" size="sm" @click="$emit('notifications')">
                    <Bell class="size-4" />
                    Notifications
                  </Button>
                  <Button size="sm" @click="$emit('invite')">
                    <UserPlus class="size-4" />
                    Invite
                  </Button>
                </slot>
              </div>
            </div>

            <!-- Description -->
            <p class="text-sm max-w-xl">
              {{ description }}
            </p>

            <!-- Quick Stats -->
            <div v-if="stats.length" class="flex flex-wrap gap-5">
              <Button v-for="stat in stats" :key="stat.label" variant="link" size="link">
                <component :is="stat.icon" class="size-4 text-blue-500" />
                {{ stat.value }} {{ stat.label }}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AudioWaveform, BadgeCheck, Shield, Settings, Bell, UserPlus } from "lucide-vue-next";
import { markRaw, type Component } from "vue";

interface Stat {
  icon: Component;
  value: string;
  label: string;
}

interface Props {
  name: string;
  type: string;
  description: string;
  createdAt: string;
  memberCount: string;
  bannerImage?: string;
  icon?: Component;
  verified?: boolean;
  stats?: Stat[];
}

withDefaults(defineProps<Props>(), {
  bannerImage: "/images/servers/p-1.jpg",
  icon: () => markRaw(AudioWaveform),
  verified: true,
  stats: () => []
});

defineEmits<{
  settings: [];
  notifications: [];
  invite: [];
}>();
</script>
