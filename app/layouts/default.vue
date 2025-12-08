<template>
  <div class="w-full min-h-screen flex items-start justify-between bg-primary">
    <Sidebar />
    <InfoPanel />

    <div class="w-full p-4">
      <slot />
    </div>
  </div>
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
