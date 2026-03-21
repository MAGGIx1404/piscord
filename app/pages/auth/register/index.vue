<template>
  <div class="w-full max-w-md">
    <div class="space-y-8">
      <AuthSignupHeader />
      <AuthSignupForm />
      <AuthHaveAnAccount />
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: "auth" });
</script>
