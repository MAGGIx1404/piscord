<template>
  <div>
    <SettingsCard
      title="Two-factor authentication"
      description="Add an extra layer of security to your account with an authenticator app."
    >
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div
            class="flex size-10 shrink-0 items-center justify-center rounded-full"
            :class="user?.is_2fa_enabled ? 'bg-green-500/10' : 'bg-muted'"
          >
            <ShieldCheck
              class="size-5"
              :class="user?.is_2fa_enabled ? 'text-green-500' : 'text-muted-foreground'"
            />
          </div>
          <div>
            <p class="text-sm font-medium">
              {{ user?.is_2fa_enabled ? "2FA is enabled" : "2FA is disabled" }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{
                user?.is_2fa_enabled
                  ? "Your account is protected with an authenticator app."
                  : "Enable 2FA to protect your account from unauthorized access."
              }}
            </p>
          </div>
        </div>

        <Badge
          v-if="user?.is_2fa_enabled"
          variant="secondary"
          class="shrink-0 border-green-500/20 bg-green-500/10 text-green-600"
        >
          Active
        </Badge>
        <Button v-else size="sm" @click="openEnable2FA"> Enable 2FA </Button>
      </div>
    </SettingsCard>

    <SettingsCard
      title="Change password"
      description="Update your password to keep your account secure."
      class="mt-6"
    >
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="currentPassword">Current password</Label>
          <div class="relative">
            <Input
              id="currentPassword"
              v-model="passwordForm.current"
              :type="showCurrentPwd ? 'text' : 'password'"
              placeholder="Enter current password"
              class="pr-10"
            />
            <button
              class="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
              type="button"
              @click="showCurrentPwd = !showCurrentPwd"
            >
              <Eye v-if="!showCurrentPwd" class="size-4" />
              <EyeOff v-else class="size-4" />
            </button>
          </div>
        </div>

        <div class="grid gap-2">
          <Label for="newPassword">New password</Label>
          <div class="relative">
            <Input
              id="newPassword"
              v-model="passwordForm.newPwd"
              :type="showNewPwd ? 'text' : 'password'"
              placeholder="Enter new password"
              class="pr-10"
            />
            <button
              class="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
              type="button"
              @click="showNewPwd = !showNewPwd"
            >
              <Eye v-if="!showNewPwd" class="size-4" />
              <EyeOff v-else class="size-4" />
            </button>
          </div>
          <div v-if="passwordForm.newPwd" class="mt-1 space-y-1">
            <div class="flex gap-1">
              <div
                v-for="i in 4"
                :key="i"
                class="h-1 flex-1 rounded-full transition-colors"
                :class="passwordStrength.score >= i ? passwordStrength.color : 'bg-muted'"
              />
            </div>
            <p class="text-xs" :class="passwordStrength.textColor">
              {{ passwordStrength.label }}
            </p>
          </div>
        </div>

        <div class="grid gap-2">
          <Label for="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            v-model="passwordForm.confirm"
            type="password"
            placeholder="Confirm new password"
          />
          <p
            v-if="passwordForm.confirm && passwordForm.newPwd !== passwordForm.confirm"
            class="text-xs text-destructive"
          >
            Passwords do not match.
          </p>
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <Button :disabled="!canChangePassword || changingPassword" @click="changePassword">
          <Loader2 v-if="changingPassword" class="mr-2 size-4 animate-spin" />
          Update password
        </Button>
      </div>
    </SettingsCard>

    <SettingsCard
      title="Danger zone"
      description="Irreversible account actions."
      class="mt-6 border-destructive/30"
    >
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-sm font-medium text-destructive">Delete account</p>
          <p class="text-xs text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
        </div>
        <Button variant="destructive" size="sm" @click="deleteDialogOpen = true">
          Delete account
        </Button>
      </div>
    </SettingsCard>

    <AlertDialog :open="deleteDialogOpen" @update:open="deleteDialogOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This action is irreversible. All your data, messages, and communities you own will be
            permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="deleteDialogOpen = false">Cancel</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            @click="deleteAccount"
          >
            Yes, delete my account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-vue-next";
import { toast } from "vue-sonner";

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const { open: openEnable2FA } = use2FASetup();
const api = useApi();

const passwordForm = reactive({ current: "", newPwd: "", confirm: "" });
const showCurrentPwd = ref(false);
const showNewPwd = ref(false);
const changingPassword = ref(false);

const passwordStrength = computed(() => {
  const p = passwordForm.newPwd;
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;

  const map: Record<number, { label: string; color: string; textColor: string }> = {
    0: { label: "Too weak", color: "bg-destructive", textColor: "text-destructive" },
    1: { label: "Weak", color: "bg-orange-500", textColor: "text-orange-500" },
    2: { label: "Fair", color: "bg-yellow-500", textColor: "text-yellow-500" },
    3: { label: "Good", color: "bg-blue-500", textColor: "text-blue-500" },
    4: { label: "Strong", color: "bg-green-500", textColor: "text-green-500" }
  };

  return { score, ...map[score] };
});

const canChangePassword = computed(
  () =>
    passwordForm.current &&
    passwordForm.newPwd.length >= 8 &&
    passwordForm.newPwd === passwordForm.confirm
);

async function changePassword() {
  if (!canChangePassword.value) return;
  changingPassword.value = true;
  try {
    await (api as any)("/api/users/me/password", {
      method: "POST",
      body: { current_password: passwordForm.current, new_password: passwordForm.newPwd }
    });
    passwordForm.current = "";
    passwordForm.newPwd = "";
    passwordForm.confirm = "";
    toast.success("Password changed successfully.");
  } catch (err: any) {
    toast.error(err?.data?.message ?? "Failed to change password.");
  } finally {
    changingPassword.value = false;
  }
}

const deleteDialogOpen = ref(false);
async function deleteAccount() {
  deleteDialogOpen.value = false;
  toast.info("Account deletion is not yet available.");
}
</script>
