<template>
  <div class="w-full max-w-md">
    <div class="space-y-8">
      <!-- Header -->
      <div class="space-y-3">
        <h1 class="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p class="text-base text-muted-foreground">Enter your credentials to continue</p>
      </div>

      <!-- Form -->
      <form class="space-y-5">
        <!-- Email Field -->
        <div class="space-y-2">
          <Label for="email" class="flex items-center justify-between">
            Email
            <span v-if="errors.email" class="text-xs text-destructive font-normal">{{
              errors.email
            }}</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            v-model="email"
            class="h-11 bg-card/50 border-border/50"
            :class="errors.email ? 'border-destructive' : ''"
          />
        </div>

        <!-- Password Field -->
        <div class="space-y-2">
          <Label for="password" class="flex items-center justify-between">
            Password
            <span v-if="errors.password" class="text-xs text-destructive font-normal">{{
              errors.password
            }}</span>
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            v-model="password"
            class="h-11 bg-card/50 border-border/50"
            :class="errors.password ? 'border-destructive' : ''"
          />
        </div>

        <!-- Submit Button -->
        <Button
          type="submit"
          size="lg"
          :disabled="isPending"
          @click.prevent="onSubmit"
          class="w-full mt-2"
        >
          <Loader2 v-if="isPending" class="size-4 mr-2 animate-spin" />
          {{ isPending ? "Signing in..." : "Sign in" }}
        </Button>
      </form>

      <!-- Sign Up Link -->
      <p class="text-muted-foreground">
        Don't have an account?
        <NuxtLink
          to="/auth/register"
          class="text-primary font-medium hover:underline underline-offset-4"
        >
          Sign up
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { toast } from "vue-sonner";
import { useForm } from "vee-validate";
import * as yup from "yup";
import { Loader2 } from "lucide-vue-next";

definePageMeta({
  layout: "auth"
});

const isPending = ref(false);
const router = useRouter();

const { errors, handleSubmit, defineField } = useForm({
  validationSchema: yup.object({
    email: yup.string().email().required(),
    password: yup.string().min(6).required()
  })
});

const [email] = defineField("email");
const [password] = defineField("password");

const processLogin = async (values) => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  isPending.value = true;
  console.log("Logging in with:", values);
};

const onSubmit = handleSubmit((v) => {
  const loginPromise = processLogin(v);
  toast.promise(loginPromise, {
    loading: "Taking you in...",
    success: "Welcome back!",
    error: (err) => {
      console.log("error from login:", err);
      return err?.statusMessage || "Something went wrong";
    }
  });
});
</script>
