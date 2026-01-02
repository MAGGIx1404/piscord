<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar";

import { AudioWaveform, Command, GalleryVerticalEnd } from "lucide-vue-next";

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "offcanvas"
});

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/images/avatar/1.png"
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise"
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup"
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free"
    }
  ],
  channels: [
    {
      name: "General",
      url: "#",
      icon: Command
    },
    {
      name: "Development",
      url: "#",
      icon: AudioWaveform
    },
    {
      name: "Design",
      url: "#",
      icon: GalleryVerticalEnd
    }
  ]
};
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <NavSwitcher :teams="data.teams" />
    </SidebarHeader>
    <SidebarContent>
      <NavChannels :channels="data.channels" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
