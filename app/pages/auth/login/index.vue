<template>
  <div class="w-1/2 flex flex-col gap-10">
    <div class="w-full space-y-4">
      <h1 class="text-5xl font-semibold">Login</h1>
      <p class="text-base">Welcome back! Please enter your credentials to access your account.</p>
    </div>

    <form class="w-full space-y-6">
      <div class="w-full space-y-2">
        <Label for="email" :class="errors.email ? 'text-destructive' : ''"
          >Email :
          {{ errors.email }}
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          v-model="email"
          :class="
            errors.email ? 'text-destructive border-destructive placeholder:text-destructive' : ''
          "
        />
      </div>
      <div class="w-full space-y-2 mt-4">
        <Label for="password" :class="errors.password ? 'text-destructive' : ''"
          >Password :
          {{ errors.password }}
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          v-model="password"
          :class="
            errors.password
              ? 'text-destructive border-destructive placeholder:text-destructive'
              : ''
          "
        />
      </div>

      <Button
        type="submit"
        size="lg"
        :disabled="isPending"
        @click.prevent="onSubmit"
        class="w-full"
      >
        {{ isPending ? "Logging in..." : "Login" }}
      </Button>

      <Separator />

      <p class="text-sm -mt-2">
        Don't have an account ?
        <Button variant="link" size="link" as-child class="text-sm">
          <NuxtLink to="/auth/register"> Sign Up </NuxtLink>
        </Button>
      </p>
    </form>
  </div>
</template>

<script setup>
import { toast } from "vue-sonner";
import { useForm } from "vee-validate";
import * as yup from "yup";

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

const [email, emailAttrs] = defineField("email");
const [password, passwordAttrs] = defineField("password");

const processLogin = async (values) => {
  await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate network delay
  isPending.value = true;

  try {
    const res = await $fetch("/api/auth/login", {
      method: "POST",
      body: {
        email: values.email,
        password: values.password
      }
    });

    isPending.value = false;
    router.push("/");
    return res;
  } catch (err) {
    isPending.value = false;
    throw err;
  }
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
