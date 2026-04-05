<template>
  <Dialog v-model:open="open">
    <DialogScrollContent class="max-w-lg gap-0 overflow-hidden p-0">
      <!-- Loading skeleton -->
      <template v-if="loading">
        <div class="h-36 w-full animate-pulse bg-muted/30" />
        <div class="space-y-4 p-6">
          <div class="flex items-center gap-3">
            <div class="size-14 shrink-0 rounded-xl bg-muted/50" />
            <div class="flex-1 space-y-2">
              <div class="h-5 w-1/2 rounded bg-muted/50" />
              <div class="h-3 w-1/3 rounded bg-muted/40" />
            </div>
          </div>
          <div class="h-4 w-full rounded bg-muted/40" />
          <div class="h-4 w-3/4 rounded bg-muted/40" />
          <div class="h-4 w-1/2 rounded bg-muted/40" />
        </div>
      </template>

      <!-- Loaded content -->
      <template v-else-if="data">
        <!-- Banner -->
        <div class="relative h-36 overflow-hidden bg-muted/20">
          <img
            v-if="data.community.banner_url"
            :src="data.community.banner_url"
            alt=""
            class="h-full w-full object-cover"
          />
          <div
            class="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent"
          />
        </div>

        <!-- Community identity -->
        <div class="relative z-2 -mt-8 px-6">
          <div class="flex items-end gap-4">
            <Avatar class="size-16 shrink-0 rounded-xl ring-4 ring-background">
              <AvatarImage :src="data.community.icon_url ?? ''" />
              <AvatarFallback class="rounded-xl text-lg font-semibold">
                {{ data.community.name.charAt(0).toUpperCase() }}
              </AvatarFallback>
            </Avatar>
            <div class="min-w-0 pb-1">
              <h2 class="truncate text-lg font-bold">{{ data.community.name }}</h2>
              <div class="flex items-center gap-3 text-xs text-muted-foreground">
                <span class="flex items-center gap-1">
                  <Users class="size-3" />
                  {{ formatNumber(data.community.member_count) }} members
                </span>
                <span v-if="data.community.category">
                  {{ data.community.category }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="space-y-5 px-6 pt-4 pb-6">
          <!-- Description -->
          <p
            v-if="data.community.description"
            class="text-sm leading-relaxed text-muted-foreground"
          >
            {{ data.community.description }}
          </p>

          <!-- Tags -->
          <div v-if="data.community.tags?.length" class="flex flex-wrap gap-1.5">
            <Badge
              v-for="tag in data.community.tags"
              :key="tag"
              variant="secondary"
              class="rounded-full text-xs"
            >
              {{ tag }}
            </Badge>
          </div>

          <!-- AI Pet -->
          <div
            v-if="data.community.is_ai_pet && data.community.ai_agent_name"
            class="flex items-start gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3"
          >
            <div class="relative">
              <div
                class="absolute -inset-0.5 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 opacity-50 blur-sm"
              />
              <Avatar class="relative size-10 ring-2 ring-violet-500/50">
                <AvatarImage :src="data.community.ai_agent_avatar ?? ''" />
                <AvatarFallback class="bg-linear-to-br from-violet-500 to-purple-600 text-white">
                  <Bot class="size-4" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <Sparkles class="size-3.5 text-violet-400" />
                <span class="text-sm font-semibold">
                  {{ data.community.ai_agent_name }}
                </span>
                <Badge
                  variant="outline"
                  v-if="data.community.ai_agent_pet_name"
                  class="text-violet-400"
                >
                  {{ data.community.ai_agent_pet_name }}
                </Badge>
              </div>
              <p
                v-if="data.community.ai_agent_description"
                class="mt-1 line-clamp-2 text-xs text-muted-foreground"
              >
                {{ data.community.ai_agent_description }}
              </p>
            </div>
          </div>

          <!-- Rules -->
          <div v-if="data.community.rules?.length" class="space-y-2">
            <h4 class="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Rules
            </h4>
            <ol class="space-y-1.5">
              <li
                v-for="(rule, i) in data.community.rules"
                :key="rule.id"
                class="flex gap-2.5 text-sm"
              >
                <span
                  class="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground"
                >
                  {{ i + 1 }}
                </span>
                <span class="text-muted-foreground">{{ rule.text }}</span>
              </li>
            </ol>
          </div>

          <!-- Owner -->
          <div v-if="owner" class="flex items-center gap-3 text-sm">
            <Crown class="size-4 text-amber-500" />
            <span class="text-muted-foreground">Owned by</span>
            <div class="flex items-center gap-2">
              <Avatar class="size-5">
                <AvatarImage :src="owner.avatar_url ?? ''" />
                <AvatarFallback class="text-[10px]">
                  {{ owner.username.charAt(0) }}
                </AvatarFallback>
              </Avatar>
              <span class="font-medium">{{ owner.username }}</span>
            </div>
          </div>

          <!-- Go to Community (if member) -->
          <Button
            v-if="data.is_member"
            class="w-full"
            @click="$emit('navigate', data.community.id)"
          >
            Go to Community
            <ChevronRight class="ml-1 size-4" />
          </Button>
        </div>
      </template>

      <DialogTitle class="sr-only">Community Details</DialogTitle>
    </DialogScrollContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Users, Crown, ChevronRight, Bot, Sparkles } from "lucide-vue-next";
import { DialogScrollContent } from "~/components/ui/dialog";

export interface CommunityOverviewData {
  community: {
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
  };
  members: Array<{
    id: string;
    user_id: string;
    username: string;
    avatar_url: string | null;
    nickname: string | null;
    joined_at: string;
    role_name: string;
  }>;
  is_member: boolean;
  is_owner: boolean;
}

const props = defineProps<{
  data: CommunityOverviewData | null;
  loading: boolean;
}>();

const open = defineModel<boolean>({ required: true });

defineEmits<{
  navigate: [id: string];
}>();

const owner = computed(() => {
  if (!props.data) return null;
  const ownerId = props.data.community.owner_id;
  return props.data.members.find((m) => m.user_id === ownerId) ?? null;
});
</script>
