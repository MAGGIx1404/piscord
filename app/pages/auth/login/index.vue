<template>
  <div class="w-1/2 flex flex-col gap-6">
    <h1 class="text-5xl font-semibold">Login</h1>
    <p class="text-base">
      Welcome back! Please enter your credentials to access your account.
    </p>

    <form class="w-full space-y-8">
      <div class="w-full space-y-2">
        <Label for="email">Email :</Label>
        <Input id="email" type="email" placeholder="Enter your email" />
      </div>

      <div class="w-full space-y-2 mt-4">
        <Label for="password">Password :</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
        />
      </div>

      <div class="w-full grid grid-cols-2 gap-2">
        <Button type="submit" size="lg">Login</Button>
        <Button variant="destructive" as-child>
          <NuxtLink to="/"> Forgot Password? </NuxtLink>
        </Button>
      </div>

      <Separator />

      <p class="text-base -mt-2">
        Don't have an account?
        <Button variant="link" size="link" as-child>
          <NuxtLink to="/auth/register"> Sign Up </NuxtLink>
        </Button>
      </p>
    </form>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "auth"
});
</script>
