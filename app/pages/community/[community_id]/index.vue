<template>
  <main class="min-h-screen w-full">
    <!-- Loading -->
    <div v-if="pending" class="flex h-96 items-center justify-center">
      <div class="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>

    <template v-else-if="community">
      <!-- Hero Banner -->
      <CommunityBanner
        :name="communityBannerProps.name"
        :type="communityBannerProps.type"
        :description="communityBannerProps.description"
        :banner-image="communityBannerProps.bannerImage"
        :verified="communityBannerProps.verified"
        :icon-image="community.icon_url ?? undefined"
        @notify="handleNotify"
        @settings="handleSettings"
        @invite="handleInvite"
      />

      <!-- Sticky Stats Bar -->
      <CommunityStatsBar :stats="quickStats" v-model:active-tab="activeTab" />

      <!-- Main content - asymmetric bento -->
      <div class="w-full px-8 py-8">
        <div class="grid grid-cols-12 gap-5">
          <!-- Left narrow column -->
          <div class="col-span-12 space-y-5 lg:col-span-3">
            <!-- AI Agent -->
            <CommunityAIAgent
              v-if="aiAgent"
              :agent="aiAgent"
              @view-profile="handleViewAgentProfile"
            />

            <!-- About -->
            <CommunityAbout
              :created-at="communityAbout.createdAt"
              :website="communityAbout.website"
              :tags="communityAbout.tags"
            />

            <!-- Rules -->
            <CommunityRules :rules="communityRules" />

            <!-- Workspaces -->
            <CommunityWorkspaces :workspaces="[]" @select="handleSelectWorkspace" />
          </div>

          <!-- Center wide column -->
          <div class="col-span-12 space-y-5 lg:col-span-6">
            <!-- Activity feed + join request moderation -->
            <CommunityActivity :community-id="communityId" />

            <!-- Channels Grid -->
            <CommunityChannelGrid
              :channels="[]"
              @create="handleCreateChannel"
              @select="handleSelectChannel"
            />
          </div>

          <!-- Right column - members focus -->
          <div class="col-span-12 space-y-5 lg:col-span-3">
            <!-- Member List (includes role filter + view-all modal) -->
            <CommunityMemberList
              :members="filteredMembers"
              :roles="memberRoles"
              :owner-id="community?.owner_id ?? ''"
              @select-member="handleSelectMember"
            />
          </div>
        </div>
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import { Users, MessageSquare, Hash, Layers } from "lucide-vue-next";
import { markRaw as markRawVue } from "vue";
import { toast } from "vue-sonner";

const route = useRoute();
const api = useApi();
const communityId = route.params.community_id as string;

// ─── API types ────────────────────────────────────────────────────────────────

interface ApiCommunity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  banner_url: string | null;
  category: string | null;
  tags: string[];
  rules: Array<{ id: number; text: string }>;
  member_count: number;
  is_public: boolean;
  require_approval: boolean;
  is_ai_pet: boolean;
  ai_agent_name: string | null;
  ai_agent_pet_name: string | null;
  ai_agent_avatar: string | null;
  ai_agent_model: string | null;
  ai_agent_description: string | null;
  owner_id: string;
  created_at: string;
}

interface ApiMember {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  nickname: string | null;
  joined_at: string;
  role_name: string;
}

interface ApiRole {
  id: string;
  name: string;
  color: string | null;
  position: number;
  is_default: boolean;
  member_count: number;
}

interface ApiOverview {
  community: ApiCommunity;
  roles: ApiRole[];
  members: ApiMember[];
  is_member: boolean;
  is_owner: boolean;
  owner_id: string;
}

// ─── Fetch overview ───────────────────────────────────────────────────────────

const { data, pending, error } = await useAsyncData<ApiOverview>(
  `community-overview-${communityId}`,
  () => api<ApiOverview>(`/api/communities/${communityId}`)
);

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: "Community not found" });
}

// Track last visited community so the home page can redirect here
const communityStore = useCommunityStore();
communityStore.setCurrentCommunity(communityId);

// ─── Derived state ────────────────────────────────────────────────────────────

const community = computed(() => data.value?.community ?? null);
const members = computed(() => data.value?.members ?? []);
const roles = computed(() => data.value?.roles ?? []);

// Banner/header props
const communityBannerProps = computed(() => ({
  name: community.value?.name ?? "",
  type: community.value?.category ?? "Community",
  description: community.value?.description ?? "",
  bannerImage: community.value?.banner_url ?? undefined,
  verified: (community.value?.member_count ?? 0) > 1000
}));

// Quick stats
const quickStats = computed(() => [
  {
    icon: markRawVue(Users),
    value: formatNumber(community.value?.member_count ?? 0),
    label: "Members"
  },
  { icon: markRawVue(MessageSquare), value: "—", label: "Messages" },
  { icon: markRawVue(Hash), value: "—", label: "Channels" },
  { icon: markRawVue(Layers), value: "—", label: "Workspaces" }
]);

// AI Agent
const aiAgent = computed(() =>
  community.value?.is_ai_pet
    ? {
        id: community.value.id,
        name: community.value.ai_agent_name ?? "AI",
        petName: community.value.ai_agent_pet_name ?? "",
        avatar: community.value.ai_agent_avatar ?? "",
        model: community.value.ai_agent_model ?? null,
        description: community.value.ai_agent_description ?? null
      }
    : null
);

// About
const communityAbout = computed(() => ({
  createdAt: community.value
    ? new Date(community.value.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric"
      })
    : "",
  website: undefined as string | undefined,
  tags: community.value?.tags ?? []
}));

// Rules
const communityRules = computed(() => (community.value?.rules ?? []).map((r) => r.text));

// State
const activeTab = ref("Overview");

const filteredMembers = computed(() =>
  members.value.map((m) => ({
    id: m.user_id,
    name: m.nickname ?? m.username,
    avatar: m.avatar_url ?? "",
    role: m.user_id === community.value?.owner_id ? "owner" : m.role_name || "member",
    status: "",
    online: false
  }))
);

// Roles for filter — counts derived from the resolved member list
const memberRoles = computed(() => {
  const all = filteredMembers.value;
  const ownerCount = all.filter((m) => m.role === "owner").length;
  return [
    { id: "all", label: "All", count: all.length, dotColor: "bg-gray-500" },
    ...(ownerCount > 0
      ? [
          {
            id: "owner",
            label: "Owner",
            count: ownerCount,
            dotColor: "bg-yellow-500",
            color: "#eab308"
          }
        ]
      : []),
    ...roles.value.map((r) => ({
      id: r.id,
      label: r.name,
      count: all.filter((m) => m.role.toLowerCase() === r.name.toLowerCase()).length,
      dotColor: r.color ? "" : "bg-green-500",
      color: r.color
    }))
  ];
});

// Helpers
function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

const router = useRouter();

// ─── Welcome toast on first join ──────────────────────────────────────────────
onMounted(() => {
  if (route.query.welcome === "1" && community.value) {
    toast.success(`Welcome to ${community.value.name}! 🎉`, {
      description:
        "You're now a member. Start exploring channels and connecting with the community.",
      duration: 5000
    });
    // Remove the query param without a page reload
    router.replace({ query: {} });
  }
});

const handleNotify = () => toast.info("Notifications toggled");
const handleSettings = () => router.push(`/community/${communityId}/settings`);
const handleInvite = () => toast.info("Invite link copied!");
const handleSelectWorkspace = (ws: any) => {};
const handleCreateChannel = () => {};
const handleSelectChannel = (ch: any) => {};
const handleSelectMember = (m: any) => {};
const handleViewAgentProfile = () => {};
</script>
