<template>
  <div class="w-full max-w-md">
    <div class="space-y-8">
      <AuthSigninHeader />
      <AuthSigninForm />
      <AuthSigninDontHaveAccount />
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: "auth" });
</script>
