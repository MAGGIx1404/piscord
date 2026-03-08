<template>
  <main class="min-h-screen w-full">
    <!-- ── Profile Header ──────────────────────────────────────────────────── -->
    <div class="relative">
      <!-- Banner -->
      <div
        class="h-40 w-full overflow-hidden bg-linear-to-br from-primary/30 via-primary/10 to-background sm:h-52"
      >
        <div
          class="h-full w-full bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:20px_20px]"
        />
      </div>

      <!-- Avatar + info row -->
      <div class="px-6 pb-5">
        <div class="-mt-10 flex flex-wrap items-end justify-between gap-4">
          <!-- Avatar -->
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

          <!-- Action buttons -->
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

        <!-- Name & meta -->
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

        <!-- Stats row -->
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

    <!-- ── Tabs ──────────────────────────────────────────────────────────────── -->
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

    <!-- ── Tab Panels ─────────────────────────────────────────────────────────── -->
    <div class="px-6 py-6">
      <!-- COMMUNITIES TAB -->
      <div v-if="activeTab === 'communities'">
        <div v-if="communityPending" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="n in 6" :key="n" class="h-20 animate-pulse rounded-xl bg-muted/40" />
        </div>
        <div
          v-else-if="!communities.length"
          class="flex flex-col items-center gap-3 py-16 text-center"
        >
          <div class="flex size-16 items-center justify-center rounded-2xl bg-muted/40">
            <Users class="size-7 text-muted-foreground" />
          </div>
          <p class="font-medium">No communities yet</p>
          <p class="text-sm text-muted-foreground">
            Discover and join communities to see them here.
          </p>
          <Button size="sm" class="mt-1" as-child>
            <NuxtLink to="/discover">Browse Communities</NuxtLink>
          </Button>
        </div>
        <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="c in communities"
            :key="c.id"
            :to="`/community/${c.id}`"
            class="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 transition-all hover:border-border hover:bg-accent/30 hover:shadow-sm"
          >
            <Avatar class="size-11 shrink-0 rounded-xl">
              <AvatarImage :src="c.icon_url ?? ''" />
              <AvatarFallback class="rounded-xl font-semibold">{{
                c.name.charAt(0)
              }}</AvatarFallback>
            </Avatar>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <p class="truncate text-sm font-semibold">{{ c.name }}</p>
                <Crown v-if="c.is_owner" class="size-3 shrink-0 text-yellow-500" />
              </div>
              <p class="text-xs text-muted-foreground">
                {{ formatNumber(c.member_count) }} members
              </p>
            </div>
            <ArrowUpRight
              class="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            />
          </NuxtLink>
        </div>
      </div>

      <!-- JOIN REQUESTS TAB -->
      <div v-else-if="activeTab === 'requests'">
        <div v-if="notifPending" class="space-y-2">
          <div v-for="n in 4" :key="n" class="h-16 animate-pulse rounded-xl bg-muted/40" />
        </div>
        <div
          v-else-if="!joinRequests.length"
          class="flex flex-col items-center gap-3 py-16 text-center"
        >
          <div class="flex size-16 items-center justify-center rounded-2xl bg-muted/40">
            <Inbox class="size-7 text-muted-foreground" />
          </div>
          <p class="font-medium">No join requests</p>
          <p class="text-sm text-muted-foreground">
            Requests you send to private communities appear here.
          </p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="req in joinRequests"
            :key="req.id"
            class="flex items-center gap-3.5 rounded-xl border border-border/60 bg-card px-4 py-3"
          >
            <Avatar class="size-10 shrink-0 rounded-lg">
              <AvatarImage :src="req.community_icon ?? ''" />
              <AvatarFallback class="rounded-lg">{{ req.community_name.charAt(0) }}</AvatarFallback>
            </Avatar>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">{{ req.community_name }}</p>
              <p class="text-xs text-muted-foreground">{{ relativeDate(req.updated_at) }}</p>
            </div>
            <span
              class="shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize"
              :class="statusClass(req.status)"
            >
              {{ req.status }}
            </span>
          </div>
        </div>
      </div>

      <!-- ACCOUNT TAB -->
      <div v-else-if="activeTab === 'account'" class="max-w-lg space-y-4">
        <!-- Username -->
        <div class="space-y-3 rounded-xl border border-border/60 bg-card p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold">Username</p>
              <p class="text-xs text-muted-foreground">Your unique handle on the platform</p>
            </div>
            <Button variant="ghost" size="sm" class="text-xs" @click="editOpen = true">
              <Pencil class="mr-1.5 size-3" /> Edit
            </Button>
          </div>
          <div class="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
            <AtSign class="size-3.5 shrink-0 text-muted-foreground" />
            <span class="font-mono text-sm">{{ user?.username }}</span>
          </div>
        </div>

        <!-- Email -->
        <div class="space-y-3 rounded-xl border border-border/60 bg-card p-4">
          <div>
            <p class="text-sm font-semibold">Email</p>
            <p class="text-xs text-muted-foreground">Your account email address</p>
          </div>
          <div class="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
            <Mail class="size-3.5 shrink-0 text-muted-foreground" />
            <span class="text-sm">{{ user?.email }}</span>
          </div>
        </div>

        <!-- 2FA -->
        <div class="rounded-xl border border-border/60 bg-card p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold">Two-Factor Auth</p>
              <p class="text-xs text-muted-foreground">Extra security on your account</p>
            </div>
            <span
              class="rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
              :class="
                user?.is_2fa_enabled
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-border bg-muted/40 text-muted-foreground'
              "
            >
              {{ user?.is_2fa_enabled ? "Enabled" : "Disabled" }}
            </span>
          </div>
        </div>

        <!-- Danger zone -->
        <div class="space-y-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p class="text-sm font-semibold text-destructive">Danger Zone</p>
          <p class="text-xs text-muted-foreground">Permanently delete your account and all data.</p>
          <Button variant="destructive" size="sm" class="text-xs" disabled> Delete Account </Button>
        </div>
      </div>
    </div>

    <!-- ── Edit Profile Dialog ─────────────────────────────────────────────── -->
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
import {
  Pencil,
  Share2,
  ShieldCheck,
  Users,
  Crown,
  ArrowUpRight,
  Inbox,
  AtSign,
  Mail,
  Loader2
} from "lucide-vue-next";
import { toast } from "vue-sonner";

const api = useApi();

// ── User ─────────────────────────────────────────────────────────────────────

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

// ── Communities ───────────────────────────────────────────────────────────────

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

// ── Join Requests ─────────────────────────────────────────────────────────────

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

// ── Tabs ──────────────────────────────────────────────────────────────────────

const tabs = [
  { id: "communities", label: "Communities" },
  { id: "requests", label: "Requests" },
  { id: "account", label: "Account" }
];
const activeTab = ref("communities");

// ── Edit Profile ──────────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function statusClass(status: string) {
  return (
    {
      pending: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
      approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      rejected: "border-red-500/40 bg-red-500/10 text-red-500",
      cancelled: "border-border bg-muted/40 text-muted-foreground"
    }[status] ?? "border-border bg-muted/40 text-muted-foreground"
  );
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  toast.success("Link copied");
}
</script>
