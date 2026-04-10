<template>
  <div>
    <SettingsCard title="Profile" description="Update your display name and public info.">
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
          <Input
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

      <div class="grid gap-2">
        <Label for="displayName">Display name</Label>
        <Input
          id="displayName"
          v-model="form.displayName"
          placeholder="Your display name"
          :disabled="savingProfile"
        />
      </div>

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
  </div>
</template>

<script setup lang="ts">
import { Camera, Loader2 } from "lucide-vue-next";
import { toast } from "vue-sonner";

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const api = useApi();

const userInitials = computed(() => {
  const u = user.value?.username ?? "";
  return u.slice(0, 2).toUpperCase();
});

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
    const data = await api<{ user: typeof user.value }>("/api/users/me", {
      method: "PATCH",
      body: { username: form.username, email: form.email }
    });
    if (data.user) userStore.setUser(data.user as any);
    toast.success("Profile updated.");
  } catch {
    toast.error("Failed to save profile.");
  } finally {
    savingProfile.value = false;
  }
}

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
    const data = await api<{ avatar_url: string }>("/api/users/avatar", {
      method: "POST",
      body: fd
    });
    userStore.setUser({ ...user.value!, avatar_url: data.avatar_url });
    avatarFile.value = null;
    toast.success("Avatar updated.");
  } catch {
    toast.error("Failed to upload avatar.");
  } finally {
    savingAvatar.value = false;
  }
}
</script>
