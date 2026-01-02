<script setup lang="ts">
import type { LucideIcon } from "lucide-vue-next";
import { Forward, MoreHorizontal, Trash2, SlidersHorizontal } from "lucide-vue-next";
import { useSidebar } from "@/components/ui/sidebar";

defineProps<{
  channels: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}>();

const { isMobile } = useSidebar();
</script>

<template>
  <SidebarGroup class="group-data-[collapsible=icon]:hidden">
    <SidebarGroupLabel>Channels</SidebarGroupLabel>
    <SidebarMenu>
      <SidebarMenuItem v-for="item in channels" :key="item.name">
        <SidebarMenuButton as-child>
          <a :href="item.url">
            <component :is="item.icon" />
            <span>{{ item.name }}</span>
          </a>
        </SidebarMenuButton>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <SidebarMenuAction show-on-hover>
              <MoreHorizontal />
              <span class="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            class="w-48 rounded-lg"
            :side="isMobile ? 'bottom' : 'right'"
            :align="isMobile ? 'end' : 'start'"
          >
            <DropdownMenuItem>
              <SlidersHorizontal class="text-muted-foreground" />
              <span> Customize Channel </span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Forward class="text-muted-foreground" />
              <span>Share Channel</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Trash2 class="text-muted-foreground" />
              <span>Delete Channel</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton class="text-sidebar-foreground/70">
          <MoreHorizontal class="text-sidebar-foreground/70" />
          <span>More</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
</template>
