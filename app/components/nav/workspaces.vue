<script setup lang="ts">
import { ChevronRight, MoreHorizontal, Plus } from "lucide-vue-next";

defineProps<{
  workspaces: {
    name: string;
    emoji: string;
    pages: {
      name: string;
      emoji: string;
      url: string;
    }[];
  }[];
}>();
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        <Collapsible v-for="workspace in workspaces" :key="workspace.name">
          <SidebarMenuItem>
            <SidebarMenuButton>
              <span>{{ workspace.emoji }}</span>
              <span>{{ workspace.name }}</span>
            </SidebarMenuButton>
            <CollapsibleTrigger as-child>
              <SidebarMenuAction
                class="left-2 bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:rotate-90"
                show-on-hover
              >
                <ChevronRight />
              </SidebarMenuAction>
            </CollapsibleTrigger>
            <SidebarMenuAction show-on-hover>
              <Plus />
            </SidebarMenuAction>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem v-for="page in workspace.pages" :key="page.name">
                  <SidebarMenuSubButton as-child>
                    <NuxtLink :to="page.url">
                      <span>{{ page.emoji }}</span>
                      <span>{{ page.name }}</span>
                    </NuxtLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>

        <SidebarMenuItem>
          <SidebarMenuButton class="text-sidebar-foreground/70">
            <MoreHorizontal />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
