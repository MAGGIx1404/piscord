<template>
  <section class="relative h-[420px] overflow-hidden">
    <!-- Banner with overlay -->
    <div class="absolute inset-0">
      <img :src="bannerImage" alt="" class="w-full h-full object-cover" />
      <div
        class="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent"
      />
      <div
        class="absolute inset-0 bg-linear-to-r from-background/80 via-transparent to-transparent"
      />
    </div>

    <!-- Floating community identity -->
    <div class="absolute bottom-0 left-0 right-0 px-8 pb-8">
      <div class="flex items-end gap-6">
        <!-- Icon with glow -->
        <div class="relative group">
          <div
            class="relative size-28 rounded-2xl bg-card border border-border/50 flex items-center justify-center shadow-2xl"
          >
            <component :is="icon" class="size-14 text-primary" />
          </div>
          <div
            v-if="verified"
            class="absolute -bottom-1 -right-1 size-6 bg-primary rounded-full flex items-center justify-center ring-4 ring-background"
          >
            <BadgeCheck class="size-4 text-white" />
          </div>
        </div>

        <!-- Title & meta -->
        <div class="flex-1 space-y-3 pb-1">
          <div class="flex items-center gap-3 flex-wrap">
            <h1 class="text-4xl font-bold tracking-tight">{{ name }}</h1>
            <Badge class="bg-primary/20 text-primary border-primary/30 px-3">{{ type }}</Badge>
          </div>
          <p class="text-muted-foreground max-w-2xl line-clamp-2">{{ description }}</p>
        </div>

        <!-- Quick actions - floating pills -->
        <div class="hidden lg:flex items-center gap-2">
          <Button
            variant="outline"
            class="rounded-full backdrop-blur-sm bg-card/50 border-border/50"
            @click="$emit('notify')"
          >
            <Bell class="size-4" />
            Notify
          </Button>
          <Button
            variant="outline"
            class="rounded-full backdrop-blur-sm bg-card/50 border-border/50"
            @click="$emit('settings')"
          >
            <Settings class="size-4" />
          </Button>
          <Button class="rounded-full px-6" @click="$emit('invite')">
            <UserPlus class="size-4" />
            Invite
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { AudioWaveform, BadgeCheck, Bell, Settings, UserPlus } from "lucide-vue-next";
import { markRaw, type Component } from "vue";

interface Props {
  name: string;
  type?: string;
  description: string;
  bannerImage?: string;
  icon?: Component;
  verified?: boolean;
}

withDefaults(defineProps<Props>(), {
  type: "Community",
  bannerImage: "/images/servers/p-1.jpg",
  icon: () => markRaw(AudioWaveform),
  verified: true
});

defineEmits<{
  notify: [];
  settings: [];
  invite: [];
}>();
</script>
