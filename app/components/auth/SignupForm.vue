<template>
  <form class="space-y-5">
    <div class="space-y-2">
      <Label for="username" class="flex items-center justify-between">
        Username
        <span v-if="errors.username" class="text-xs font-normal text-destructive">
          {{ errors.username }}
        </span>
        <span v-else-if="usernameAvailable === false" class="text-xs font-normal text-destructive">
          Username taken
        </span>
      </Label>
      <div class="relative">
        <Input
          id="username"
          type="text"
          placeholder="Choose a username"
          v-model="username"
          class="h-11 border-border/50 bg-card/50 pr-10"
          :class="errors.username || usernameAvailable === false ? 'border-destructive' : ''"
        />
        <div class="absolute top-1/2 right-3 size-4 -translate-y-1/2">
          <Loader2 v-if="checking" class="size-full animate-spin text-muted-foreground" />
          <CircleCheck v-else-if="usernameAvailable === true" class="size-full text-primary" />
          <XCircle v-else-if="usernameAvailable === false" class="size-full text-destructive" />
        </div>
      </div>
    </div>

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
      :disabled="isPending || usernameAvailable === false"
      @click.prevent="onSubmit"
      class="mt-2 w-full"
      :is-loading="isPending"
    >
      Create account
    </Button>
  </form>
</template>

<script lang="ts" setup>
import { CircleCheck, XCircle, Loader2 } from "lucide-vue-next";

definePageMeta({ layout: "auth" });

const { checking, email, errors, isPending, onSubmit, password, username, usernameAvailable } =
  useRegister();
</script>
