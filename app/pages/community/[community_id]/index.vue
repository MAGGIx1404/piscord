<template>
  <main class="min-h-screen w-full">
    <div v-if="pending" class="flex h-96 items-center justify-center">
      <div class="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>

    <template v-else-if="community">
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

      <CommunityStatsBar :stats="quickStats" />

      <div class="w-full px-8 py-8">
        <div class="grid grid-cols-12 gap-5">
          <div class="col-span-12 space-y-5 lg:col-span-3">
            <CommunityAIAgent
              v-if="aiAgent"
              :agent="aiAgent"
              @view-profile="handleViewAgentProfile"
            />

            <CommunityAbout
              :created-at="communityAbout.createdAt"
              :website="communityAbout.website"
              :tags="communityAbout.tags"
            />

            <CommunityRules :rules="communityRules" />

            <CommunityWorkspaces :workspaces="mappedWorkspaces" @select="handleSelectWorkspace" />
          </div>

          <div class="col-span-12 space-y-5 lg:col-span-6">
            <CommunityActivity
              :community-id="communityId"
              @member-count-update="handleMemberCountUpdate"
              @member-join="handleMemberJoin"
            />

            <CommunityChannelGrid
              :channels="mappedChannels"
              @create="handleCreateChannel"
              @select="handleSelectChannel"
            />
          </div>

          <div class="col-span-12 space-y-5 lg:col-span-3">
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
import { Users, MessageSquare, Hash, Layers, Mic, Megaphone, FolderOpen } from "lucide-vue-next";
import { markRaw as markRawVue } from "vue";
import { toast } from "vue-sonner";
import type { LiveActivityItem } from "~/composables/useCommunityLive";

const route = useRoute();
const api = useApi();
const communityId = route.params.community_id as string;

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

const { data, pending, error } = await useAsyncData<ApiOverview>(
  `community-overview-${communityId}`,
  () => api<ApiOverview>(`/api/communities/${communityId}`)
);

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: "Community not found" });
}

interface ApiChannel {
  id: string;
  name: string;
  type: string;
  topic: string | null;
  position: number;
  is_private: boolean;
  parent_id: string | null;
  last_message_at: string | null;
  created_at: string;
}

interface ApiWorkspace {
  id: string;
  name: string;
  emoji: string | null;
  description: string | null;
  is_public: boolean;
  created_by: string;
  created_at: string;
}

const { data: channelsData } = await useAsyncData(`community-channels-${communityId}`, () =>
  api<{ channels: ApiChannel[]; can_manage: boolean }>(`/api/communities/${communityId}/channels`)
);

const { data: workspacesData } = await useAsyncData(`community-workspaces-${communityId}`, () =>
  api<{ workspaces: ApiWorkspace[]; can_manage: boolean }>(
    `/api/communities/${communityId}/workspaces`
  )
);

const communityStore = useCommunityStore();
communityStore.setCurrentCommunity(communityId);

const community = computed(() => data.value?.community ?? null);
const members = computed(() => data.value?.members ?? []);
const roles = computed(() => data.value?.roles ?? []);

const defaultChannelStyle = {
  icon: markRawVue(Hash),
  bg: "bg-blue-500/20",
  color: "text-blue-500"
};

function getChannelStyle(type: string) {
  const styles: Record<string, typeof defaultChannelStyle> = {
    text: defaultChannelStyle,
    voice: { icon: markRawVue(Mic), bg: "bg-green-500/20", color: "text-green-500" },
    announcement: { icon: markRawVue(Megaphone), bg: "bg-amber-500/20", color: "text-amber-500" },
    category: { icon: markRawVue(FolderOpen), bg: "bg-purple-500/20", color: "text-purple-500" }
  };
  return styles[type] ?? defaultChannelStyle;
}

const mappedChannels = computed(() =>
  (channelsData.value?.channels ?? []).map((ch) => {
    const s = getChannelStyle(ch.type);
    return {
      id: ch.id,
      name: ch.name,
      icon: s.icon,
      iconBg: s.bg,
      iconColor: s.color,
      lastActivity: ch.last_message_at ? "Active" : "",
      messageCount: "--"
    };
  })
);

const wsColors = [
  "bg-primary/20 text-primary",
  "bg-blue-500/20 text-blue-500",
  "bg-purple-500/20 text-purple-500",
  "bg-amber-500/20 text-amber-500"
] as const;

const mappedWorkspaces = computed(() =>
  (workspacesData.value?.workspaces ?? []).map((ws, i) => ({
    id: ws.id,
    name: ws.name,
    icon: markRawVue(Layers),
    color: wsColors[i % wsColors.length] as string,
    channelCount: 0
  }))
);

const communityBannerProps = computed(() => ({
  name: community.value?.name ?? "",
  type: community.value?.category ?? "Community",
  description: community.value?.description ?? "",
  bannerImage: community.value?.banner_url ?? undefined,
  verified: (community.value?.member_count ?? 0) > 1000
}));

const quickStats = computed(() => [
  {
    icon: markRawVue(Users),
    value: formatNumber(community.value?.member_count ?? 0),
    label: "Members"
  },
  { icon: markRawVue(MessageSquare), value: "—", label: "Messages" },
  {
    icon: markRawVue(Hash),
    value: formatNumber(channelsData.value?.channels?.length ?? 0),
    label: "Channels"
  },
  {
    icon: markRawVue(Layers),
    value: formatNumber(workspacesData.value?.workspaces?.length ?? 0),
    label: "Workspaces"
  }
]);

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

const communityRules = computed(() => (community.value?.rules ?? []).map((r) => r.text));

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

function handleMemberCountUpdate(count: number) {
  if (data.value?.community) {
    data.value.community.member_count = count;
  }
}

function handleMemberJoin(member: LiveActivityItem) {
  if (data.value) {
    data.value.members = [
      ...data.value.members,
      {
        id: member.id,
        user_id: member.user_id,
        username: member.username,
        avatar_url: member.avatar_url,
        nickname: null,
        joined_at: member.joined_at,
        role_name: "member"
      }
    ];
  }
}

const router = useRouter();

onMounted(() => {
  if (route.query.welcome === "1" && community.value) {
    toast.success(`Welcome to ${community.value.name}! 🎉`, {
      description:
        "You're now a member. Start exploring channels and connecting with the community.",
      duration: 5000
    });
    router.replace({ query: {} });
  }
});

const handleNotify = () => toast.info("Notifications toggled");
const handleSettings = () => router.push(`/community/${communityId}/settings`);
const handleInvite = () => toast.info("Invite link copied!");
const handleSelectWorkspace = (ws: any) =>
  router.push(`/community/${communityId}/workspaces/${ws.id}`);
const handleCreateChannel = () => router.push(`/community/${communityId}/channels`);
const handleSelectChannel = (ch: any) => router.push(`/community/${communityId}/channels/${ch.id}`);
const handleSelectMember = (m: any) => {};
const handleViewAgentProfile = () => {};
</script>
