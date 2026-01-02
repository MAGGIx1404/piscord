<template>
  <div class="w-full h-screen grid grid-cols-16 p-4 gap-4 bg-background">
    <Sidebar />
    <div class="w-full col-span-13">
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
