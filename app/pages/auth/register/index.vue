<template>
  <div class="w-1/2 flex flex-col gap-6">
    <h1 class="text-5xl font-semibold">Create an Account</h1>
    <p class="text-base">
      Join us today! Please fill in the details below to create your account.
    </p>

    <form class="w-full space-y-8">
      <div class="w-full space-y-2 relative">
        <Label
          for="username"
          :class="
            errors.username || usernameAvailable === false
              ? 'text-destructive'
              : ''
          "
          >Username : {{ errors.username }}
          {{ usernameAvailable === false ? " - Username is taken" : "" }}
        </Label>
        <Input
          id="username"
          type="text"
          placeholder="Choose a username"
          v-model="username"
          v-bind="usernameAttrs"
          :class="
            errors.username || usernameAvailable === false
              ? 'text-destructive border-destructive placeholder:text-destructive'
              : ''
          "
        />
        <div class="absolute right-2 bottom-4 size-6">
          <template v-if="checking">
            <Loader2Icon class="size-6 animate-spin" />
          </template>
          <template v-else-if="usernameAvailable === true">
            <CircleCheckIcon class="size-6 text-green-600" />
          </template>
          <template v-else-if="usernameAvailable === false">
            <OctagonXIcon class="size-6 text-red-600" />
          </template>
        </div>
      </div>
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
          v-bind="emailAttrs"
          :class="
            errors.email
              ? 'text-destructive border-destructive placeholder:text-destructive'
              : ''
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
          v-bind="passwordAttrs"
          :class="
            errors.password
              ? 'text-destructive border-destructive placeholder:text-destructive'
              : ''
          "
        />
      </div>
      <div class="w-full grid grid-cols-2 gap-2">
        <Button
          type="submit"
          size="lg"
          :disabled="isPending"
          @click.prevent="onSubmit"
        >
          {{ isPending ? "Creating Account..." : "Register" }}
        </Button>
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
import { CircleCheckIcon, Loader2Icon, OctagonXIcon } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { useForm } from "vee-validate";
import * as yup from "yup";

definePageMeta({
  layout: "auth"
});

const { errors, handleSubmit, defineField } = useForm({
  validationSchema: yup.object({
    username: yup.string().min(3).max(20).required(),
    email: yup.string().email().required(),
    password: yup.string().min(6).required()
  })
});

const router = useRouter();
const isPending = ref(false);

const [username, usernameAttrs] = defineField("username");
const [email, emailAttrs] = defineField("email");
const [password, passwordAttrs] = defineField("password");

// Username availability state
const usernameAvailable = ref(null);
const checking = ref(false);
let usernameDebounce = null;

const checkUsername = async (value) => {
  if (!value || value.length < 3) {
    usernameAvailable.value = null;
    checking.value = false;
    return;
  }

  checking.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
    const res = await $fetch("/api/auth/username-availability", {
      method: "POST",
      body: { username: value }
    });
    usernameAvailable.value = !!res.available;
  } catch (err) {
    usernameAvailable.value = null;
  } finally {
    checking.value = false;
  }
};

watch(username, (val) => {
  usernameAvailable.value = null;
  checking.value = false;
  if (usernameDebounce) clearTimeout(usernameDebounce);
  usernameDebounce = setTimeout(() => checkUsername(val), 400);
});

const processRegistration = async (values) => {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
  isPending.value = true;

  try {
    const res = await $fetch("/api/auth/register", {
      method: "POST",
      body: {
        username: values.username,
        email: values.email,
        password: values.password
      }
    });

    isPending.value = false;
    router.push({
      name: "auth-login"
    });
    return res;
  } catch (err) {
    isPending.value = false;
    throw err;
  }
};

const onSubmit = handleSubmit((v) => {
  const registrationPromise = processRegistration(v);
  toast.promise(registrationPromise, {
    loading: "Creating your account...",
    success: "Account created successfully! Please log in.",
    error: (err) => {
      return err?.statusMessage || "Something went wrong";
    }
  });
});
</script>
