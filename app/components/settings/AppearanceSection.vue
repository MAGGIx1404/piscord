<template>
  <div>
    <SettingsCard title="Theme" description="Choose how Flowcord looks for you.">
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SettingsThemePreview
          v-for="t in themes"
          :key="t.id"
          :theme="t"
          :active="selectedTheme === t.id"
          @select="applyTheme(t.id)"
        />
      </div>
    </SettingsCard>

    <SettingsCard
      title="Interface"
      description="Adjust layout and density preferences."
      class="mt-6"
    >
      <div class="space-y-5">
        <SettingsNotifRow
          label="Compact mode"
          description="Reduce spacing between messages and elements."
          v-model="appearance.compact"
        />
        <Separator />
        <SettingsNotifRow
          label="Animations"
          description="Show motion effects and transitions."
          v-model="appearance.animations"
        />
        <Separator />
        <SettingsNotifRow
          label="Show avatars in sidebar"
          description="Display user avatars in the channel sidebar."
          v-model="appearance.sidebarAvatars"
        />
      </div>
    </SettingsCard>
  </div>
</template>

<script setup lang="ts">
const theme = useTheme();
const isDark = theme.enabled;

interface ThemeDef {
  id: string;
  label: string;
  dark: boolean;
  accent: string;
}

const themes: ThemeDef[] = [
  { id: "light", label: "Light", dark: false, accent: "bg-white border-2" },
  { id: "dark", label: "Dark", dark: true, accent: "bg-zinc-900 border-2" },
  {
    id: "system",
    label: "System",
    dark: false,
    accent: "bg-gradient-to-br from-white to-zinc-900 border-2"
  }
];
const selectedTheme = ref<string>(isDark.value ? "dark" : "light");

function applyTheme(id: string) {
  selectedTheme.value = id;
  if (id === "dark") {
    if (!isDark.value) theme.toggleTheme();
  } else if (id === "light") {
    if (isDark.value) theme.toggleTheme();
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark !== isDark.value) theme.toggleTheme();
  }
}

const appearance = reactive({
  compact: false,
  animations: true,
  sidebarAvatars: true
});
</script>
