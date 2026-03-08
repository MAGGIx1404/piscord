<template>
  <div class="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center">
    <div
      class="flex items-center gap-2 rounded-[28px] border border-border/60 bg-card/80 px-3 py-2 shadow-lg backdrop-blur-xl sm:gap-3 sm:rounded-[48px] sm:px-4 sm:py-2.5"
    >
      <NavDockIcon :icon="LayoutDashboardIcon" label="Dashboard" to="/" />
      <NavDockIcon :icon="CompassIcon" label="Discover" to="/discover" />
      <NavDockIcon :icon="UsersIcon" label="Friends" to="/me" />
      <span class="mx-0.5 h-5 w-px bg-border/60" aria-hidden="true" />
      <NavDockIcon :icon="HashIcon" label="Channels" to="/me" />
      <NavDockIcon :icon="LayersIcon" label="Workspaces" to="/me" />
      <span class="mx-0.5 h-5 w-px bg-border/60" aria-hidden="true" />
      <NotificationModal>
        <template #trigger="{ unreadCount }">
          <button
            class="group relative grid h-10 w-10 place-items-center rounded-xl border border-border/60 bg-card shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:scale-[1.08] hover:border-border hover:bg-accent sm:h-11 sm:w-11"
            aria-label="Notifications"
          >
            <Bell
              class="h-[18px] w-[18px] text-muted-foreground transition-colors duration-200 group-hover:text-accent-foreground"
              :stroke-width="1.8"
            />
            <span
              v-if="unreadCount > 0"
              class="absolute -top-1.5 -right-1.5 grid h-4 w-4 place-items-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground ring-2 ring-background"
            >
              {{ unreadCount > 9 ? "9+" : unreadCount }}
            </span>
            <span
              class="tooltip pointer-events-none absolute -bottom-6 text-[9px] tracking-wide whitespace-nowrap text-muted-foreground sm:text-[10px]"
            >
              Notifications
            </span>
          </button>
        </template>
      </NotificationModal>
      <NavDockIcon :icon="UserCircleIcon" label="Profile" to="/me" />
      <NavDockIcon :icon="SettingsIcon" label="Settings" to="/me/settings" />
      <span class="mx-0.5 h-5 w-px bg-border/60" aria-hidden="true" />
      <button
        class="group relative grid h-10 w-10 place-items-center rounded-xl border border-border/60 bg-card shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:scale-[1.08] hover:border-border hover:bg-accent sm:h-11 sm:w-11"
        :aria-label="isDark ? 'Switch to light' : 'Switch to dark'"
        @click="toggleTheme"
      >
        <Sun
          v-if="isDark"
          class="h-[18px] w-[18px] text-muted-foreground transition-colors duration-200 group-hover:text-accent-foreground"
          :stroke-width="1.8"
        />
        <Moon
          v-else
          class="h-[18px] w-[18px] text-muted-foreground transition-colors duration-200 group-hover:text-accent-foreground"
          :stroke-width="1.8"
        />
        <span
          class="tooltip pointer-events-none absolute -bottom-6 text-[9px] tracking-wide whitespace-nowrap text-muted-foreground sm:text-[10px]"
        >
          {{ isDark ? "Light" : "Dark" }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  LayoutDashboard as LayoutDashboardIcon,
  Compass as CompassIcon,
  Users as UsersIcon,
  Hash as HashIcon,
  Layers as LayersIcon,
  Bell,
  Sun,
  Moon,
  UserCircle as UserCircleIcon,
  Settings as SettingsIcon
} from "lucide-vue-next";
import NotificationModal from "~/components/NotificationModal.vue";

const { enabled: isDark, toggleTheme } = useTheme();
</script>

<style scoped>
.tooltip {
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 0.15s,
    transform 0.15s;
}
.group:hover .tooltip {
  opacity: 1;
  transform: translateY(0);
}
</style>
