<template>
  <div class="w-full max-w-md">
    <div class="space-y-8">
      <!-- Header -->
      <div class="space-y-3">
        <h1 class="text-3xl font-bold tracking-tight">Two-factor authentication</h1>
        <p class="text-base text-muted-foreground">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <!-- Form -->
      <form class="space-y-6" @submit.prevent="onSubmit">
        <div class="space-y-3">
          <Label class="flex items-center justify-between">
            Authentication code
            <span v-if="error" class="text-xs font-normal text-destructive">{{ error }}</span>
          </Label>

          <!-- OTP inputs -->
          <div class="flex justify-between gap-2">
            <Input
              v-for="(_, i) in 6"
              :key="i"
              :ref="(el) => setInputRef(el, i)"
              v-model="digits[i]"
              type="text"
              inputmode="numeric"
              maxlength="1"
              class="h-14 w-full border-border/50 bg-card/50 text-center text-xl font-semibold"
              :class="error ? 'border-destructive' : ''"
              @input="onDigitInput(i, $event)"
              @keydown="onDigitKeydown(i, $event)"
              @paste.prevent="onPaste($event)"
            />
          </div>
        </div>

        <Button type="submit" size="lg" :disabled="isPending || code.length < 6" class="w-full">
          <Loader2 v-if="isPending" class="mr-2 size-4 animate-spin" />
          {{ isPending ? "Verifying..." : "Verify" }}
        </Button>
      </form>

      <p class="text-sm text-muted-foreground">
        Lost access to your app?
        <NuxtLink
          to="/auth/login"
          class="font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to login
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { Loader2 } from "lucide-vue-next";
import { toast } from "vue-sonner";

definePageMeta({ layout: "auth" });

const route = useRoute();
const router = useRouter();
const { verify2FA } = useAuth();

const userId = computed(() => route.query.user_id);

// Guard: no user_id → back to login
if (!userId.value) {
  router.replace("/auth/login");
}

// ─── OTP state ────────────────────────────────────────────────────────────────

const digits = ref(Array(6).fill(""));
const inputRefs = [];
const isPending = ref(false);
const error = ref("");

const code = computed(() => digits.value.join(""));

function setInputRef(el, i) {
  if (el) inputRefs[i] = el;
}

function focusAt(i) {
  inputRefs[i]?.$el?.focus?.() ?? inputRefs[i]?.focus?.();
}

function onDigitInput(i, event) {
  const val = event.target.value.replace(/\D/g, "").slice(-1);
  digits.value[i] = val;
  error.value = "";
  if (val && i < 5) focusAt(i + 1);
  // Auto-submit when all filled
  if (code.value.length === 6) onSubmit();
}

function onDigitKeydown(i, event) {
  if (event.key === "Backspace" && !digits.value[i] && i > 0) {
    focusAt(i - 1);
  }
  if (event.key === "ArrowLeft" && i > 0) focusAt(i - 1);
  if (event.key === "ArrowRight" && i < 5) focusAt(i + 1);
}

function onPaste(event) {
  const text = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
  if (!text) return;
  text.split("").forEach((char, i) => {
    digits.value[i] = char;
  });
  focusAt(Math.min(text.length, 5));
  if (text.length === 6) onSubmit();
}

// ─── Submit ───────────────────────────────────────────────────────────────────

async function onSubmit() {
  if (code.value.length < 6 || isPending.value) return;
  isPending.value = true;
  error.value = "";

  try {
    await verify2FA(userId.value, code.value);
    router.push("/");
  } catch (err) {
    const status = err?.statusCode ?? err?.status;
    error.value =
      status === 401
        ? "Invalid code. Please try again."
        : err?.data?.message || "Verification failed";
    digits.value = Array(6).fill("");
    focusAt(0);
    toast.error(error.value);
  } finally {
    isPending.value = false;
  }
}
</script>
