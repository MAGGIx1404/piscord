<template>
  <div class="w-80 sticky top-0 h-screen py-4">
    <div
      class="size-full bg-white border-2 border-black shadow-lg rounded-lg p-2"
    >
      <p class="text-base font-semibold">
        {{
          userStore.isAuthenticated
            ? `Logged in as ${userStore.user.username}`
            : "Not logged in"
        }}
      </p>
      <p class="text-base">
        Username : {{ userStore.getUser.username }}<br />
        Email : {{ userStore.getUser.email }}<br />
      </p>
    </div>
  </div>
</template>

<script setup>
const userStore = useUserStore();
</script>
