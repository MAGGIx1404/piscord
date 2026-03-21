<template>
  <form class="space-y-5">
    <div class="space-y-2">
      <Label for="email" class="flex items-center justify-between">
        Email
        <span v-if="errors.email" class="text-xs font-normal text-destructive">
          {{ errors.email }}
        </span>
      </Label>
      <Input
        id="email"
        type="email"
        placeholder="you@example.com"
        v-model="email"
        class="h-11 border-border/50 bg-card/50"
        :class="errors.email ? 'border-destructive' : ''"
      />
    </div>

    <div class="space-y-2">
      <Label for="password" class="flex items-center justify-between">
        Password
        <span v-if="errors.password" class="text-xs font-normal text-destructive">
          {{ errors.password }}
        </span>
      </Label>
      <Input
        id="password"
        type="password"
        placeholder="••••••••"
        v-model="password"
        class="h-11 border-border/50 bg-card/50"
        :class="errors.password ? 'border-destructive' : ''"
      />
    </div>

    <Button
      type="submit"
      size="lg"
      :disabled="isPending"
      @click.prevent="onSubmit"
      class="mt-2 w-full"
      :is-loading="isPending"
    >
      Sign in
    </Button>
  </form>
</template>

<script setup>
definePageMeta({ layout: "auth" });
const { email, errors, isPending, onSubmit, password } = useSignin();
</script>
