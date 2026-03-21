<template>
  <div class="w-full max-w-md">
    <div class="space-y-8">
      <!-- Header -->
      <div class="space-y-3">
        <h1 class="text-3xl font-bold tracking-tight">Create an account</h1>
        <p class="text-base text-muted-foreground">Enter your details to get started</p>
      </div>

      <!-- Form -->
      <form class="space-y-5">
        <!-- Username Field -->
        <div class="space-y-2">
          <Label for="username" class="flex items-center justify-between">
            Username
            <span v-if="errors.username" class="text-xs font-normal text-destructive">{{
              errors.username
            }}</span>
            <span
              v-else-if="usernameAvailable === false"
              class="text-xs font-normal text-destructive"
              >Username taken</span
            >
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
          :disabled="isPending || usernameAvailable === false"
          @click.prevent="onSubmit"
          class="mt-2 w-full"
        >
          <Loader2 v-if="isPending" class="mr-2 size-4 animate-spin" />
          {{ isPending ? "Creating account..." : "Create account" }}
        </Button>
      </form>

      <!-- Sign In Link -->
      <p class="text-muted-foreground">
        Already have an account?
        <NuxtLink
          to="/auth/login"
          class="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { CircleCheck, XCircle, Loader2 } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { useForm } from "vee-validate";
import * as yup from "yup";

definePageMeta({
  layout: "auth"
});

const { register, checkUsername: checkUsernameAvailability } = useAuth();
const router = useRouter();
const isPending = ref(false);

const { errors, handleSubmit, defineField } = useForm({
  validationSchema: yup.object({
    username: yup
      .string()
      .min(3, "At least 3 characters")
      .max(20, "At most 20 characters")
      .matches(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only")
      .required("Username is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().min(8, "At least 8 characters").required("Password is required")
  })
});

const [username] = defineField("username");
const [email] = defineField("email");
const [password] = defineField("password");

// ─── Username availability ────────────────────────────────────────────────────

const usernameAvailable = ref(null);
const checking = ref(false);
let usernameDebounce = null;

const runUsernameCheck = async (value) => {
  if (!value || value.length < 3) {
    usernameAvailable.value = null;
    checking.value = false;
    return;
  }
  checking.value = true;
  try {
    usernameAvailable.value = await checkUsernameAvailability(value);
  } catch {
    usernameAvailable.value = null;
  } finally {
    checking.value = false;
  }
};

watch(username, (val) => {
  usernameAvailable.value = null;
  checking.value = false;
  clearTimeout(usernameDebounce);
  usernameDebounce = setTimeout(() => runUsernameCheck(val), 400);
});

// ─── Submit ───────────────────────────────────────────────────────────────────

const processRegister = async (values) => {
  isPending.value = true;
  try {
    await register(values.username, values.email, values.password);
    router.push("/auth/login");
  } finally {
    isPending.value = false;
  }
};

const onSubmit = handleSubmit((v) => {
  const registerPromise = processRegister(v);
  toast.promise(registerPromise, {
    loading: "Creating your account...",
    success: "Account created! Please sign in.",
    error: (err) => {
      const status = err?.statusCode ?? err?.status;
      if (status === 409) return "Username or email is already taken";
      return err?.data?.message || err?.statusMessage || "Something went wrong";
    }
  });
});
</script>
