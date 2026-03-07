<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar";

import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  LayoutDashboard,
  Compass
} from "lucide-vue-next";

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "offcanvas"
});

// This is sample data.
const data = {
  teams: [
    {
      name: "Orion Group",
      logo: GalleryVerticalEnd,
      plan: "Enterprise"
    },
    {
      name: "Delta Inc.",
      logo: AudioWaveform,
      plan: "Startup"
    },
    {
      name: "Developers Hub",
      logo: Command,
      plan: "Free"
    }
  ],
  channels: [
    {
      name: "General",
      url: "/community/orion_group/channels/general",
      icon: Command
    },
    {
      name: "Development",
      url: "/community/orion_group/channels/development",
      icon: AudioWaveform
    },
    {
      name: "Design",
      url: "/community/orion_group/channels/design",
      icon: GalleryVerticalEnd
    }
  ],
  workspaces: [
    {
      name: "Personal Life Management",
      emoji: "🏠",
      pages: [
        {
          name: "Daily Journal & Reflection",
          url: "/community/orion_group/workspaces/1",
          emoji: "📔"
        },
        {
          name: "Health & Wellness Tracker",
          url: "/community/orion_group/workspaces/2",
          emoji: "🍏"
        },
        {
          name: "Personal Growth & Learning Goals",
          url: "/community/orion_group/workspaces/3",
          emoji: "🌟"
        }
      ]
    },
    {
      name: "Professional Development",
      emoji: "💼",
      pages: [
        {
          name: "Career Objectives & Milestones",
          url: "/community/orion_group/workspaces/1",
          emoji: "🎯"
        },
        {
          name: "Skill Acquisition & Training Log",
          url: "/community/orion_group/workspaces/1",
          emoji: "🧠"
        },
        {
          name: "Networking Contacts & Events",
          url: "/community/orion_group/workspaces/1",
          emoji: "🤝"
        }
      ]
    },
    {
      name: "Creative Projects",
      emoji: "🎨",
      pages: [
        {
          name: "Writing Ideas & Story Outlines",
          url: "/community/orion_group/workspaces/1",
          emoji: "✍️"
        },
        {
          name: "Art & Design Portfolio",
          url: "/community/orion_group/workspaces/1",
          emoji: "🖼️"
        },
        {
          name: "Music Composition & Practice Log",
          url: "/community/orion_group/workspaces/1",
          emoji: "🎵"
        }
      ]
    }
  ]
};
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <NavCommunitySwitcher :teams="data.teams" />
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup class="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton class="text-sidebar-foreground" as-child>
              <NuxtLink to="/community/orion_group">
                <LayoutDashboard class="text-sidebar-foreground" />
                <span> Overview </span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton class="text-sidebar-foreground" as-child>
              <NuxtLink to="/discover">
                <Compass class="text-sidebar-foreground" />
                <span> Discover </span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <NavChannels :channels="data.channels" />
      <NavWorkspaces :workspaces="data.workspaces" />
    </SidebarContent>
    <SidebarFooter> </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
