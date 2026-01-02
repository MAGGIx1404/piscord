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
      url: "/teams/orion/channels/general",
      icon: Command
    },
    {
      name: "Development",
      url: "/teams/orion/channels/development",
      icon: AudioWaveform
    },
    {
      name: "Design",
      url: "/teams/orion/channels/design",
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
          url: "#",
          emoji: "📔"
        },
        {
          name: "Health & Wellness Tracker",
          url: "#",
          emoji: "🍏"
        },
        {
          name: "Personal Growth & Learning Goals",
          url: "#",
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
          url: "#",
          emoji: "🎯"
        },
        {
          name: "Skill Acquisition & Training Log",
          url: "#",
          emoji: "🧠"
        },
        {
          name: "Networking Contacts & Events",
          url: "#",
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
          url: "#",
          emoji: "✍️"
        },
        {
          name: "Art & Design Portfolio",
          url: "#",
          emoji: "🖼️"
        },
        {
          name: "Music Composition & Practice Log",
          url: "#",
          emoji: "🎵"
        }
      ]
    },
    {
      name: "Home Management",
      emoji: "🏡",
      pages: [
        {
          name: "Household Budget & Expense Tracking",
          url: "#",
          emoji: "💰"
        },
        {
          name: "Home Maintenance Schedule & Tasks",
          url: "#",
          emoji: "🔧"
        },
        {
          name: "Family Calendar & Event Planning",
          url: "#",
          emoji: "📅"
        }
      ]
    },
    {
      name: "Travel & Adventure",
      emoji: "🧳",
      pages: [
        {
          name: "Trip Planning & Itineraries",
          url: "#",
          emoji: "🗺️"
        },
        {
          name: "Travel Bucket List & Inspiration",
          url: "#",
          emoji: "🌎"
        },
        {
          name: "Travel Journal & Photo Gallery",
          url: "#",
          emoji: "📸"
        }
      ]
    }
  ]
};
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <NavTeamSwitcher :teams="data.teams" />
    </SidebarHeader>
    <SidebarContent>
      <NavChannels :channels="data.channels" />
      <NavWorkspaces :workspaces="data.workspaces" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
