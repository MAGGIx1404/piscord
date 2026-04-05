<template>
  <main class="min-h-screen w-full">
    <div class="relative">
      <div
        class="h-40 w-full overflow-hidden rounded-xl bg-linear-to-br from-primary/30 via-primary/10 to-background sm:h-52"
      >
        <div
          class="h-full w-full bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[20px_20px]"
        />
      </div>

      <div class="px-6 pb-5">
        <div class="-mt-10 flex flex-wrap items-end justify-between gap-4">
          <div class="relative shrink-0">
            <Avatar class="size-20 rounded-2xl ring-4 ring-background sm:size-24">
              <AvatarImage :src="user?.avatar_url ?? ''" />
              <AvatarFallback class="rounded-2xl text-2xl font-bold">
                {{ user?.username?.charAt(0).toUpperCase() }}
              </AvatarFallback>
            </Avatar>
            <span
              class="absolute right-1 bottom-1 size-3.5 rounded-full bg-green-500 ring-2 ring-background"
            />
          </div>

          <div class="flex items-center gap-2 pb-1">
            <Button variant="outline" size="sm" class="gap-1.5 text-xs" @click="editOpen = true">
              <Pencil class="size-3.5" />
              Edit Profile
            </Button>
            <Button variant="ghost" size="icon" class="size-8 rounded-lg" @click="copyLink">
              <Share2 class="size-3.5" />
            </Button>
          </div>
        </div>

        <div class="mt-3 space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-xl leading-none font-bold sm:text-2xl">{{ user?.username }}</h1>
            <span
              v-if="user?.is_2fa_enabled"
              class="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
            >
              <ShieldCheck class="size-3" />
              2FA
            </span>
          </div>
          <p class="text-sm text-muted-foreground">{{ user?.email }}</p>
          <p class="text-xs text-muted-foreground/70">Joined {{ joinedDate }}</p>
        </div>

        <div class="mt-4 flex flex-wrap gap-4 sm:gap-6">
          <div class="text-center">
            <p class="text-lg leading-none font-bold tabular-nums">{{ communities.length }}</p>
            <p class="mt-0.5 text-[11px] text-muted-foreground">Communities</p>
          </div>
          <div class="w-px self-stretch bg-border" />
          <div class="text-center">
            <p class="text-lg leading-none font-bold tabular-nums">
              {{ communities.filter((c) => c.is_owner).length }}
            </p>
            <p class="mt-0.5 text-[11px] text-muted-foreground">Owned</p>
          </div>
          <div class="w-px self-stretch bg-border" />
          <div class="text-center">
            <p class="text-lg leading-none font-bold tabular-nums">
              {{ joinRequests.filter((r) => r.status === "pending").length }}
            </p>
            <p class="mt-0.5 text-[11px] text-muted-foreground">Pending</p>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-border/60 px-6">
      <div class="flex gap-0">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="relative px-4 py-3 text-sm font-medium transition-colors"
          :class="
            activeTab === tab.id
              ? 'text-foreground after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:rounded-full after:bg-primary'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="px-6 py-6">
      <ProfileCommunitiesTab
        v-if="activeTab === 'communities'"
        :communities="communities"
        :pending="communityPending"
      />
      <ProfileJoinRequestsTab
        v-else-if="activeTab === 'requests'"
        :requests="joinRequests"
        :pending="notifPending"
      />
      <ProfileAccountTab v-else-if="activeTab === 'account'" :user="user" @edit="editOpen = true" />
    </div>

    <Dialog v-model:open="editOpen">
      <DialogContent class="max-w-sm gap-5">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your username or avatar URL.</DialogDescription>
        </DialogHeader>
        <div class="space-y-3">
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Username</label>
            <Input v-model="editUsername" placeholder="yourname" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Avatar URL</label>
            <Input v-model="editAvatarUrl" placeholder="https://..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" @click="editOpen = false">Cancel</Button>
          <Button size="sm" :disabled="saving" @click="saveProfile">
            <Loader2 v-if="saving" class="mr-1.5 size-3.5 animate-spin" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </main>
</template>

<script setup lang="ts">
import { Pencil, Share2, ShieldCheck, Loader2 } from "lucide-vue-next";
import { toast } from "vue-sonner";

const api = useApi();

const { data: userData, refresh: refreshUser } = await useAsyncData(
  "me-profile",
  () =>
    api<{
      user: {
        id: string;
        username: string;
        email: string;
        avatar_url: string | null;
        is_2fa_enabled: boolean;
        created_at: string;
      };
    }>("/api/users/me"),
  { server: false }
);
const user = computed(() => userData.value?.user ?? null);

const joinedDate = computed(() => {
  if (!user.value?.created_at) return "";
  return new Date(user.value.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });
});

interface UserCommunity {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
  member_count: number;
  is_public: boolean;
  is_owner: boolean;
  joined_at: string;
}

const { data: communityData, pending: communityPending } = await useAsyncData(
  "me-communities",
  () => api<{ communities: UserCommunity[] }>("/api/users/me/communities"),
  { server: false }
);
const communities = computed(() => communityData.value?.communities ?? []);

interface JoinRequest {
  id: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  updated_at: string;
  community_name: string;
  community_icon: string | null;
}

const { data: notifData, pending: notifPending } = await useAsyncData(
  "me-join-requests",
  () => api<{ requests: JoinRequest[]; unreadCount: number }>("/api/users/me/join-requests"),
  { server: false }
);
const joinRequests = computed(() => notifData.value?.requests ?? []);

const tabs = [
  { id: "communities", label: "Communities" },
  { id: "requests", label: "Requests" },
  { id: "account", label: "Account" }
];
const activeTab = ref("communities");

const editOpen = ref(false);
const saving = ref(false);
const editUsername = ref("");
const editAvatarUrl = ref("");

watch(editOpen, (open) => {
  if (open) {
    editUsername.value = user.value?.username ?? "";
    editAvatarUrl.value = user.value?.avatar_url ?? "";
  }
});

async function saveProfile() {
  saving.value = true;
  try {
    await api("/api/users/me", {
      method: "PATCH",
      body: { username: editUsername.value, avatar_url: editAvatarUrl.value }
    });
    await refreshUser();
    editOpen.value = false;
    toast.success("Profile updated");
  } catch (e: any) {
    toast.error(e?.data?.message ?? "Failed to update profile");
  } finally {
    saving.value = false;
  }
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  toast.success("Link copied");
}
</script>
