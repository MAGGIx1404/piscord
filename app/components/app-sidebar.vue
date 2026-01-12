<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar";
import { LayoutDashboard, Compass, Hash } from "lucide-vue-next";

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "offcanvas"
});

const userStore = useUserStore();
const communityStore = useCommunityStore();

const user = computed(() => ({
  name: userStore.user?.username || "",
  email: userStore.user?.email || "",
  avatar: userStore.user?.avatar || "/images/avatar/3.png"
}));

const hasCommunities = computed(() => communityStore.hasCommunities);
const communities = computed(() => communityStore.communities);
const currentCommunity = computed(() => communityStore.currentCommunity);

// @todo: Fetch channels and workspaces
const channels = computed(() => {
  if (!currentCommunity.value) return [];
  return [
    {
      name: "General",
      url: `/community/${currentCommunity.value.slug}/channels/general`,
      icon: Hash
    }
  ];
});

const workspaces = computed(() => {
  if (!currentCommunity.value) return [];
  return [];
});
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <NavCommunitySwitcher v-if="hasCommunities" :communities="communities" />
      <div v-else class="p-2">
        <div class="flex items-center gap-2 px-2">
          <div
            class="flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
          >
            <Compass class="size-5" />
          </div>
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate text-base font-medium">Piscord</span>
            <span class="truncate text-xs text-muted-foreground">Find your community</span>
          </div>
        </div>
      </div>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup class="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem v-if="currentCommunity">
            <SidebarMenuButton class="text-sidebar-foreground" as-child>
              <NuxtLink :to="`/community/${currentCommunity.slug}`">
                <LayoutDashboard class="text-sidebar-foreground" />
                <span>Overview</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton class="text-sidebar-foreground" as-child>
              <NuxtLink to="/discover">
                <Compass class="text-sidebar-foreground" />
                <span>Discover</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <NavChannels v-if="currentCommunity && channels.length > 0" :channels="channels" />
      <NavWorkspaces v-if="currentCommunity && workspaces.length > 0" :workspaces="workspaces" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
