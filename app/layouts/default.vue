<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <div class="flex flex-1 flex-col gap-4 p-4">
        <AppHeader />
        <slot />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup>
const store = useUserStore();

const { data } = await useFetch("/api/auth/me", {
  headers: {
    "content-type": "application/json"
  },
  method: "GET",
  server: true
});

if (data.value) {
  store.setUser(data.value.user);
}
</script>
