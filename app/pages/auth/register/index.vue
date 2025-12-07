<template>
  <div class="w-1/2 flex flex-col gap-6">
    <h1 class="text-5xl font-semibold">Create an Account</h1>
    <p class="text-base">
      Join us today! Please fill in the details below to create your account.
    </p>

    <form class="w-full space-y-8">
      <div class="w-full space-y-2">
        <Label for="username">Username :</Label>
        <Input id="username" type="text" placeholder="Choose a username" />
      </div>
      <div class="w-full space-y-2">
        <Label for="email">Email :</Label>
        <Input id="email" type="email" placeholder="Enter your email" />
      </div>
      <div class="w-full space-y-2 mt-4">
        <Label for="password">Password :</Label>
        <Input id="password" type="password" placeholder="Create a password" />
      </div>
      <div class="w-full grid grid-cols-2 gap-2">
        <Button type="submit" size="lg">Sign Up</Button>
        <Button variant="secondary" as-child>
          <NuxtLink to="/"> Need Help? </NuxtLink>
        </Button>
      </div>

      <Separator />

      <p class="text-base -mt-2">
        Already have an account?
        <Button variant="link" size="link" as-child>
          <NuxtLink to="/auth/login"> Sign In </NuxtLink>
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
