<template>
  <div class="mx-auto w-full max-w-4xl px-4 py-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold tracking-tight">Settings</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Manage your account preferences and security settings.
      </p>
    </div>

    <!-- Settings Layout -->
    <div class="flex flex-col gap-8 md:flex-row">
      <!-- Sidebar Nav -->
      <aside class="w-full shrink-0 md:w-52">
        <nav class="flex flex-row gap-1 md:flex-col">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors"
            :class="
              activeTab === tab.id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            "
            @click="activeTab = tab.id"
          >
            <component :is="tab.icon" class="size-4 shrink-0" />
            {{ tab.label }}
          </button>
        </nav>
      </aside>

      <!-- Content -->
      <div class="min-w-0 flex-1 space-y-6">
        <!-- ── Account ──────────────────────────────────────────────────── -->
        <section v-if="activeTab === 'account'">
          <SettingsCard title="Profile" description="Update your display name and public info.">
            <!-- Avatar -->
            <div class="flex items-center gap-4">
              <div class="relative">
                <Avatar class="size-16">
                  <AvatarImage :src="user?.avatar_url ?? ''" :alt="user?.username" />
                  <AvatarFallback class="text-lg">
                    {{ userInitials }}
                  </AvatarFallback>
                </Avatar>
                <button
                  class="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition-opacity hover:opacity-90"
                  @click="triggerAvatarInput"
                >
                  <Camera class="size-3.5" />
                </button>
                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onAvatarChange"
                />
              </div>
              <div>
                <p class="font-medium">{{ user?.username }}</p>
                <p class="text-xs text-muted-foreground">JPG, PNG, or WebP · Max 5 MB</p>
              </div>
              <Button
                v-if="avatarFile"
                size="sm"
                :disabled="savingAvatar"
                class="ml-auto"
                @click="saveAvatar"
              >
                <Loader2 v-if="savingAvatar" class="mr-2 size-4 animate-spin" />
                Save avatar
              </Button>
            </div>

            <Separator />

            <!-- Display name -->
            <div class="grid gap-2">
              <Label for="displayName">Display name</Label>
              <Input
                id="displayName"
                v-model="form.displayName"
                placeholder="Your display name"
                :disabled="savingProfile"
              />
            </div>

            <!-- Username -->
            <div class="grid gap-2">
              <Label for="username">Username</Label>
              <div class="relative">
                <span
                  class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground"
                  >@</span
                >
                <Input
                  id="username"
                  v-model="form.username"
                  class="pl-7"
                  placeholder="username"
                  :disabled="savingProfile"
                />
              </div>
            </div>
          </SettingsCard>

          <SettingsCard title="Contact" description="Manage your email address." class="mt-6">
            <div class="grid gap-2">
              <Label for="email">Email address</Label>
              <Input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="you@example.com"
                :disabled="savingProfile"
              />
            </div>
          </SettingsCard>

          <div class="mt-6 flex justify-end">
            <Button :disabled="savingProfile" @click="saveProfile">
              <Loader2 v-if="savingProfile" class="mr-2 size-4 animate-spin" />
              Save changes
            </Button>
          </div>
        </section>

        <!-- ── Security ─────────────────────────────────────────────────── -->
        <section v-else-if="activeTab === 'security'">
          <!-- Two-factor authentication -->
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

          <!-- Change password -->
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
                <!-- Strength bar -->
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

          <!-- Danger zone -->
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
        </section>

        <!-- ── Notifications ─────────────────────────────────────────────── -->
        <section v-else-if="activeTab === 'notifications'">
          <SettingsCard
            title="Push notifications"
            description="Control what you get notified about in real time."
          >
            <div class="space-y-5">
              <SettingsNotifRow
                label="Direct messages"
                description="New messages from friends and DMs."
                v-model="notifs.directMessages"
              />
              <Separator />
              <SettingsNotifRow
                label="Mentions"
                description="When someone @mentions you in a channel."
                v-model="notifs.mentions"
              />
              <Separator />
              <SettingsNotifRow
                label="Community activity"
                description="Announcements and updates from your communities."
                v-model="notifs.communityActivity"
              />
              <Separator />
              <SettingsNotifRow
                label="Friend requests"
                description="When someone sends you a friend request."
                v-model="notifs.friendRequests"
              />
              <Separator />
              <SettingsNotifRow
                label="Role assignments"
                description="When a moderator assigns or removes a role."
                v-model="notifs.roleChanges"
              />
            </div>
          </SettingsCard>

          <SettingsCard
            title="Email notifications"
            description="Choose which updates are sent to your email."
            class="mt-6"
          >
            <div class="space-y-5">
              <SettingsNotifRow
                label="Security alerts"
                description="Unusual sign-ins or password changes."
                v-model="notifs.emailSecurity"
                :locked="true"
              />
              <Separator />
              <SettingsNotifRow
                label="Product updates"
                description="New features and platform announcements."
                v-model="notifs.emailUpdates"
              />
              <Separator />
              <SettingsNotifRow
                label="Community digests"
                description="Weekly summary of activity in your communities."
                v-model="notifs.emailDigests"
              />
            </div>
          </SettingsCard>

          <!-- Do not disturb -->
          <SettingsCard
            title="Do not disturb"
            description="Mute all notifications for a period of time."
            class="mt-6"
          >
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in dndOptions"
                :key="opt.value"
                size="sm"
                :variant="dndActive === opt.value ? 'default' : 'outline'"
                @click="setDnd(opt.value)"
              >
                {{ opt.label }}
              </Button>
            </div>
            <p v-if="dndActive" class="mt-3 text-xs text-muted-foreground">
              Notifications muted until {{ dndUntil }}.
            </p>
          </SettingsCard>

          <div class="mt-6 flex justify-end">
            <Button :disabled="savingNotifs" @click="saveNotifications">
              <Loader2 v-if="savingNotifs" class="mr-2 size-4 animate-spin" />
              Save preferences
            </Button>
          </div>
        </section>

        <!-- ── Appearance ────────────────────────────────────────────────── -->
        <section v-else-if="activeTab === 'appearance'">
          <SettingsCard title="Theme" description="Choose how Flowcord looks for you.">
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <SettingsThemePreview
                v-for="t in themes"
                :key="t.id"
                :theme="t"
                :active="selectedTheme === t.id"
                @select="applyTheme(t.id)"
              />
            </div>
          </SettingsCard>

          <SettingsCard
            title="Interface"
            description="Adjust layout and density preferences."
            class="mt-6"
          >
            <div class="space-y-5">
              <SettingsNotifRow
                label="Compact mode"
                description="Reduce spacing between messages and elements."
                v-model="appearance.compact"
              />
              <Separator />
              <SettingsNotifRow
                label="Animations"
                description="Show motion effects and transitions."
                v-model="appearance.animations"
              />
              <Separator />
              <SettingsNotifRow
                label="Show avatars in sidebar"
                description="Display user avatars in the channel sidebar."
                v-model="appearance.sidebarAvatars"
              />
            </div>
          </SettingsCard>
        </section>
      </div>
    </div>
  </div>

  <!-- Delete account confirmation dialog -->
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
</template>

<script setup lang="ts">
import { User, ShieldCheck, Bell, Palette, Camera, Eye, EyeOff, Loader2 } from "lucide-vue-next";
import { toast } from "vue-sonner";

// ─── Meta ───────────────────────────────────────────────────────────────────
definePageMeta({ layout: "default" });

// ─── Store / composables ────────────────────────────────────────────────────
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const { open: openEnable2FA } = use2FASetup();
const theme = useTheme();
const route = useRoute();

// ─── Tabs ────────────────────────────────────────────────────────────────────
const tabs = [
  { id: "account", label: "Account", icon: User },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette }
];
const activeTab = ref((route.query.tab as string) || "account");

// ─── User initials ────────────────────────────────────────────────────────────
const userInitials = computed(() => {
  const u = user.value?.username ?? "";
  return u.slice(0, 2).toUpperCase();
});

// ─── Account form ────────────────────────────────────────────────────────────
const form = reactive({
  displayName: user.value?.username ?? "",
  username: user.value?.username ?? "",
  email: user.value?.email ?? ""
});

watch(user, (u) => {
  if (u) {
    form.displayName = u.username;
    form.username = u.username;
    form.email = u.email;
  }
});

const savingProfile = ref(false);

async function saveProfile() {
  savingProfile.value = true;
  try {
    const token = userStore.accessToken;
    const data = await $fetch<{ user: typeof user.value }>("/api/users/me", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: { username: form.username, email: form.email }
    });
    if (data.user) userStore.setUser(data.user as any);
    useToast().success("Profile updated.");
  } catch {
    useToast().error("Failed to save profile.");
  } finally {
    savingProfile.value = false;
  }
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
const avatarInput = ref<HTMLInputElement | null>(null);
const avatarFile = ref<File | null>(null);
const savingAvatar = ref(false);

function triggerAvatarInput() {
  avatarInput.value?.click();
}

function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) avatarFile.value = file;
}

async function saveAvatar() {
  if (!avatarFile.value) return;
  savingAvatar.value = true;
  try {
    const fd = new FormData();
    fd.append("avatar", avatarFile.value);
    const token = userStore.accessToken;
    const data = await $fetch<{ avatar_url: string }>("/api/users/avatar", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    });
    userStore.setUser({ ...user.value!, avatar_url: data.avatar_url });
    avatarFile.value = null;
    useToast().success("Avatar updated.");
  } catch {
    useToast().error("Failed to upload avatar.");
  } finally {
    savingAvatar.value = false;
  }
}

// ─── Password ────────────────────────────────────────────────────────────────
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
    await ($fetch as any)("/api/users/me/password", {
      method: "POST",
      headers: { Authorization: `Bearer ${userStore.accessToken}` },
      body: { current_password: passwordForm.current, new_password: passwordForm.newPwd }
    });
    passwordForm.current = "";
    passwordForm.newPwd = "";
    passwordForm.confirm = "";
    useToast().success("Password changed successfully.");
  } catch (err: any) {
    useToast().error(err?.data?.message ?? "Failed to change password.");
  } finally {
    changingPassword.value = false;
  }
}

// ─── Delete account ────────────────────────────────────────────────────────
const deleteDialogOpen = ref(false);
async function deleteAccount() {
  deleteDialogOpen.value = false;
  useToast().info("Account deletion is not yet available.");
}

// ─── Notifications ────────────────────────────────────────────────────────
const notifs = reactive({
  directMessages: true,
  mentions: true,
  communityActivity: false,
  friendRequests: true,
  roleChanges: false,
  emailSecurity: true,
  emailUpdates: false,
  emailDigests: false
});

const savingNotifs = ref(false);
async function saveNotifications() {
  savingNotifs.value = true;
  await new Promise((r) => setTimeout(r, 600));
  savingNotifs.value = false;
  useToast().success("Notification preferences saved.");
}

// ─── DND ─────────────────────────────────────────────────────────────────
const dndOptions = [
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "4 hours", value: 240 },
  { label: "Until tomorrow", value: 960 },
  { label: "Off", value: 0 }
];
const dndActive = ref(0);
const dndUntil = computed(() => {
  if (!dndActive.value) return "";
  const d = new Date(Date.now() + dndActive.value * 60_000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
});

function setDnd(mins: number) {
  dndActive.value = mins;
}

// ─── Appearance ───────────────────────────────────────────────────────────
const isDark = theme.enabled;

interface ThemeDef {
  id: string;
  label: string;
  dark: boolean;
  accent: string;
}

const themes: ThemeDef[] = [
  { id: "light", label: "Light", dark: false, accent: "bg-white border-2" },
  { id: "dark", label: "Dark", dark: true, accent: "bg-zinc-900 border-2" },
  {
    id: "system",
    label: "System",
    dark: false,
    accent: "bg-gradient-to-br from-white to-zinc-900 border-2"
  }
];
const selectedTheme = ref<string>(isDark.value ? "dark" : "light");

function applyTheme(id: string) {
  selectedTheme.value = id;
  if (id === "dark") {
    if (!isDark.value) theme.toggleTheme();
  } else if (id === "light") {
    if (isDark.value) theme.toggleTheme();
  } else {
    // system
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark !== isDark.value) theme.toggleTheme();
  }
}

const appearance = reactive({
  compact: false,
  animations: true,
  sidebarAvatars: true
});

// ─── Toast helper ─────────────────────────────────────────────────────────
function useToast() {
  return {
    success: (msg: string) => toast.success(msg),
    error: (msg: string) => toast.error(msg),
    info: (msg: string) => toast.info(msg)
  };
}
</script>
