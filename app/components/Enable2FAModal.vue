<template>
  <Dialog :open="isOpen" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-md">
      <!-- Step 0: Prompt -->
      <template v-if="step === 'prompt'">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <ShieldCheck class="size-5 text-primary" />
            Secure your account
          </DialogTitle>
          <DialogDescription>
            Two-factor authentication adds an extra layer of security. Each time you sign in, you'll
            need a code from your authenticator app.
          </DialogDescription>
        </DialogHeader>

        <div class="flex flex-col items-center gap-4 py-4">
          <div class="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck class="size-9 text-primary" />
          </div>
          <ul class="w-full space-y-2 text-sm text-muted-foreground">
            <li class="flex items-center gap-2">
              <Check class="size-4 shrink-0 text-primary" />
              Protects against stolen passwords
            </li>
            <li class="flex items-center gap-2">
              <Check class="size-4 shrink-0 text-primary" />
              Works with any TOTP app (Authy, Google Authenticator…)
            </li>
            <li class="flex items-center gap-2">
              <Check class="size-4 shrink-0 text-primary" />
              Takes less than a minute to set up
            </li>
          </ul>
        </div>

        <DialogFooter class="gap-2">
          <Button variant="ghost" @click="close">Maybe later</Button>
          <Button @click="startSetup">
            Enable 2FA
            <ArrowRight class="ml-2 size-4" />
          </Button>
        </DialogFooter>
      </template>

      <!-- Step 1: Scan QR code -->
      <template v-if="step === 'scan'">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <ShieldCheck class="size-5 text-primary" />
            Enable two-factor authentication
          </DialogTitle>
          <DialogDescription>
            Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.)
          </DialogDescription>
        </DialogHeader>

        <div class="flex flex-col items-center gap-4 py-2">
          <!-- QR code -->
          <div
            v-if="loading"
            class="flex size-48 items-center justify-center rounded-xl border bg-muted"
          >
            <Loader2 class="size-8 animate-spin text-muted-foreground" />
          </div>
          <img
            v-else-if="qrCode"
            :src="qrCode"
            alt="2FA QR code"
            class="size-48 rounded-xl border bg-white p-2"
          />

          <!-- Manual entry secret -->
          <div v-if="!loading && secret" class="w-full space-y-1.5">
            <p class="text-xs text-muted-foreground">Can't scan? Enter this code manually:</p>
            <div
              class="flex cursor-pointer items-center justify-between gap-2 rounded-lg border bg-muted/60 px-3 py-2 font-mono text-sm tracking-widest transition-colors hover:bg-muted"
              @click="copySecret"
            >
              <span class="break-all select-all">{{ secret }}</span>
              <Copy v-if="!copied" class="size-4 shrink-0 text-muted-foreground" />
              <Check v-else class="size-4 shrink-0 text-primary" />
            </div>
          </div>
        </div>

        <DialogFooter class="gap-2 sm:gap-0">
          <Button variant="ghost" @click="close">Cancel</Button>
          <Button :disabled="loading" @click="step = 'verify'">
            I've scanned it
            <ArrowRight class="ml-2 size-4" />
          </Button>
        </DialogFooter>
      </template>

      <!-- Step 2: Verify code -->
      <template v-else-if="step === 'verify'">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <ShieldCheck class="size-5 text-primary" />
            Verify your authenticator
          </DialogTitle>
          <DialogDescription>
            Enter the 6-digit code shown in your authenticator app to confirm the setup.
          </DialogDescription>
        </DialogHeader>

        <div class="flex flex-col items-center gap-4 py-2">
          <div class="flex gap-2">
            <Input
              v-for="(_, i) in 6"
              :key="i"
              :ref="(el) => setInputRef(el, i)"
              v-model="digits[i]"
              type="text"
              inputmode="numeric"
              maxlength="1"
              class="h-12 w-full bg-card/50 text-center text-lg font-semibold"
              :class="codeError ? 'border-destructive' : ''"
              @input="onDigitInput(i, $event)"
              @keydown="onDigitKeydown(i, $event)"
              @paste.prevent="onPaste($event)"
            />
          </div>
          <p v-if="codeError" class="text-xs text-destructive">{{ codeError }}</p>
        </div>

        <DialogFooter class="gap-2 sm:gap-0">
          <Button variant="ghost" @click="step = 'scan'">
            <ArrowLeft class="mr-2 size-4" />
            Back
          </Button>
          <Button :disabled="verifying || code.length < 6" @click="onVerify">
            <Loader2 v-if="verifying" class="mr-2 size-4 animate-spin" />
            {{ verifying ? "Verifying..." : "Enable 2FA" }}
          </Button>
        </DialogFooter>
      </template>

      <!-- Step 3: Success -->
      <template v-else-if="step === 'success'">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <ShieldCheck class="size-5 text-primary" />
            2FA enabled!
          </DialogTitle>
          <DialogDescription>
            Your account is now protected with two-factor authentication.
          </DialogDescription>
        </DialogHeader>

        <div class="flex flex-col items-center gap-4 py-6">
          <div class="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck class="size-9 text-primary" />
          </div>
          <p class="text-center text-sm text-muted-foreground">
            Every time you sign in you'll be asked for a verification code from your authenticator
            app.
          </p>
        </div>

        <DialogFooter>
          <Button class="w-full" @click="close">Done</Button>
        </DialogFooter>
      </template>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from "vue";
import { ShieldCheck, ArrowRight, ArrowLeft, Loader2, Copy, Check } from "lucide-vue-next";

const { isOpen, close } = use2FASetup();
const { setup2FA, verify2FA } = useAuth();
const userStore = useUserStore();

const step = ref("prompt"); // 'prompt' | 'scan' | 'verify' | 'success'
const loading = ref(false);
const qrCode = ref("");
const secret = ref("");
const copied = ref(false);

const digits = ref(Array(6).fill(""));
const inputRefs: HTMLInputElement[] = [];
const verifying = ref(false);
const codeError = ref("");

const code = computed(() => digits.value.join(""));

function resetState() {
  step.value = "prompt";
  qrCode.value = "";
  secret.value = "";
  digits.value = Array(6).fill("");
  codeError.value = "";
}

watch(isOpen, (val) => {
  if (val) resetState();
});

// If the modal mounts while isOpen is already true (e.g. set before layout rendered)
onMounted(() => {
  if (isOpen.value) resetState();
});

async function startSetup() {
  step.value = "scan";
  loading.value = true;
  try {
    const data = await setup2FA();
    qrCode.value = data.qr_code;
    secret.value = data.secret;
  } catch {
    close();
  } finally {
    loading.value = false;
  }
}

function onOpenChange(val: boolean) {
  if (!val) close();
}

async function copySecret() {
  await navigator.clipboard.writeText(secret.value).catch(() => {});
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function setInputRef(el: Element | ComponentPublicInstance | null, i: number) {
  if (el) inputRefs[i] = (el as { $el?: HTMLInputElement }).$el ?? (el as HTMLInputElement);
}

function focusAt(i: number) {
  inputRefs[i]?.focus?.();
}

function onDigitInput(i: number, event: Event) {
  const val = (event.target as HTMLInputElement).value.replace(/\D/g, "").slice(-1);
  digits.value[i] = val;
  codeError.value = "";
  if (val && i < 5) focusAt(i + 1);
}

function onDigitKeydown(i: number, event: KeyboardEvent) {
  if (event.key === "Backspace" && !digits.value[i] && i > 0) focusAt(i - 1);
  if (event.key === "ArrowLeft" && i > 0) focusAt(i - 1);
  if (event.key === "ArrowRight" && i < 5) focusAt(i + 1);
}

function onPaste(event: ClipboardEvent) {
  const text = event.clipboardData?.getData("text").replace(/\D/g, "").slice(0, 6);
  if (!text) return;
  text.split("").forEach((char: string, i: number) => {
    digits.value[i] = char;
  });
  focusAt(Math.min(text.length, 5));
}

async function onVerify() {
  if (code.value.length < 6 || verifying.value) return;
  verifying.value = true;
  codeError.value = "";

  try {
    await verify2FA(userStore.user!.id, code.value);
    // Update the store so the modal won't re-prompt
    userStore.setUser({ ...userStore.user!, is_2fa_enabled: true });
    step.value = "success";
  } catch (err: unknown) {
    const e = err as Record<string, number | undefined>;
    const status = e?.statusCode ?? e?.status;
    codeError.value = status === 401 ? "Invalid code. Please try again." : "Verification failed.";
    digits.value = Array(6).fill("");
    nextTick(() => focusAt(0));
  } finally {
    verifying.value = false;
  }
}
</script>
