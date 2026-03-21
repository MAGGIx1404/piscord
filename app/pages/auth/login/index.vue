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
            <span v-if="errors.email" class="text-xs font-normal text-destructive">{{
              errors.email
            }}</span>
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

        <!-- Password Field -->
        <div class="space-y-2">
          <Label for="password" class="flex items-center justify-between">
            Password
            <span v-if="errors.password" class="text-xs font-normal text-destructive">{{
              errors.password
            }}</span>
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

        <!-- Submit Button -->
        <Button
          type="submit"
          size="lg"
          :disabled="isPending"
          @click.prevent="onSubmit"
          class="mt-2 w-full"
        >
          <Loader2 v-if="isPending" class="mr-2 size-4 animate-spin" />
          {{ isPending ? "Signing in..." : "Sign in" }}
        </Button>
      </form>

      <!-- Sign Up Link -->
      <p class="text-muted-foreground">
        Don't have an account?
        <NuxtLink
          to="/auth/register"
          class="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign up
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import * as yup from "yup";
import { Loader2 } from "lucide-vue-next";
import { set } from "@vueuse/core";

definePageMeta({
  layout: "auth"
});

const { login } = useAuth();
const isPending = ref(false);
const router = useRouter();

const { errors, handleSubmit, defineField } = useForm({
  validationSchema: yup.object({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().min(1, "Password is required").required("Password is required")
  })
});

const [email] = defineField("email");
const [password] = defineField("password");

const processLogin = async (values) => {
  isPending.value = true;
  try {
    const result = await login(values.email, values.password);

    if ("requires_2fa" in result) {
      router.push(`/auth/2fa?user_id=${result.user_id}`);
      return;
    }

    await router.push("/");

    // Auto-open 2FA setup dialog if not yet enabled
    if (!result.user.is_2fa_enabled) {
      const { open } = use2FASetup();
      setTimeout(() => {
        open();
      }, 2000);
    }
  } finally {
    isPending.value = false;
  }
};

const onSubmit = handleSubmit((v) => {
  const loginPromise = processLogin(v);
  toast.promise(loginPromise, {
    loading: "Signing you in...",
    success: "Welcome back!",
    error: (err) => {
      const status = err?.statusCode ?? err?.status;
      if (status === 401) return "Invalid email or password";
      return err?.data?.message || err?.statusMessage || "Something went wrong";
    }
  });
});
</script>
