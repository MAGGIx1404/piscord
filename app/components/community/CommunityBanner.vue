<template>
  <section class="relative h-[420px] overflow-hidden">
    <!-- Banner with overlay -->
    <div class="absolute inset-0 overflow-hidden rounded-t-xl">
      <img :src="bannerImage" alt="" class="h-full w-full object-cover" />
      <div
        class="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent"
      />
      <div
        class="absolute inset-0 bg-linear-to-r from-background/80 via-transparent to-transparent"
      />
    </div>

    <!-- Floating community identity -->
    <div class="absolute right-0 bottom-0 left-0 px-8 pb-8">
      <div class="flex items-end gap-6">
        <!-- Icon with glow -->
        <div class="group relative">
          <div
            class="relative flex size-28 items-center justify-center overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl"
          >
            <Avatar class="size-full rounded-none">
              <AvatarImage :src="iconImage as string" />
              <AvatarFallback class="text-4xl">{{ name.charAt(0) }}</AvatarFallback>
            </Avatar>
          </div>
          <div
            v-if="verified"
            class="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-primary ring-4 ring-background"
          >
            <BadgeCheck class="size-4 text-white" />
          </div>
        </div>

        <!-- Title & meta -->
        <div class="flex-1 space-y-3 pb-1">
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="text-4xl font-bold tracking-tight">{{ name }}</h1>
            <Badge class="border-primary/30 bg-primary/20 px-3 text-primary">{{ type }}</Badge>
          </div>
          <p class="line-clamp-2 max-w-2xl text-muted-foreground">{{ description }}</p>
        </div>

        <!-- Quick actions - floating pills -->
        <div class="hidden items-center gap-2 lg:flex">
          <Button
            variant="outline"
            class="rounded-full border-border/50 bg-card/50 backdrop-blur-sm"
            @click="$emit('notify')"
          >
            <Bell class="size-4" />
            Notify
          </Button>
          <Button
            variant="outline"
            class="rounded-full border-border/50 bg-card/50 backdrop-blur-sm"
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
  iconImage?: string;
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
