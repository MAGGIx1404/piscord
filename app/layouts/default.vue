<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
        <AppHeader />
        <slot />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup>
const userStore = useUserStore();
const communityStore = useCommunityStore();

const { data } = await useFetch("/api/user/me", {
  headers: { "content-type": "application/json" },
  method: "GET",
  server: true
});

const { data: communitiesData } = await useFetch("/api/user/communities", {
  server: true
});

if (data.value) {
  userStore.setUser(data.value);
}

communityStore.setCommunities(communitiesData.value.communities);
</script>
