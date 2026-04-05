<template>
  <div class="mx-auto w-full max-w-4xl px-4 py-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold tracking-tight">Settings</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Manage your account preferences and security settings.
      </p>
    </div>

    <div class="flex flex-col gap-8 md:flex-row">
      <aside class="w-full shrink-0 md:w-52">
        <nav class="flex flex-row gap-1 md:flex-col">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors"
            :class="
              activeTab === tab.id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            "
            @click="activeTab = tab.id"
          >
            <component :is="tab.icon" class="size-4 shrink-0" />
            {{ tab.label }}
          </button>
        </nav>
      </aside>

      <div class="min-w-0 flex-1 space-y-6">
        <SettingsAccountSection v-if="activeTab === 'account'" />
        <LazySettingsSecuritySection v-else-if="activeTab === 'security'" />
        <LazySettingsNotificationsSection v-else-if="activeTab === 'notifications'" />
        <LazySettingsAppearanceSection v-else-if="activeTab === 'appearance'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, ShieldCheck, Bell, Palette } from "lucide-vue-next";

definePageMeta({ layout: "default" });

const route = useRoute();

const tabs = [
  { id: "account", label: "Account", icon: User },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette }
];
const activeTab = ref((route.query.tab as string) || "account");
</script>
