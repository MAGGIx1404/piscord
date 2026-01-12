<script setup lang="ts">
import { ChevronsUpDown, Plus, Users } from "lucide-vue-next";
import { useSidebar } from "@/components/ui/sidebar";

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  tier: string;
  member_count: number;
}

const props = defineProps<{
  communities: Community[];
}>();

const { isMobile } = useSidebar();
const communityStore = useCommunityStore();
const router = useRouter();

const activeCommunity = computed(() => communityStore.currentCommunity);

function selectCommunity(community: Community) {
  communityStore.setCurrentCommunity(community.slug);
  router.push(`/community/${community.slug}`);
}

function getTierLabel(tier: string) {
  switch (tier) {
    case "enterprise":
      return "Enterprise";
    case "premium":
      return "Premium";
    default:
      return "Free";
  }
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div
              class="flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden"
            >
              <img
                v-if="activeCommunity?.logo_url"
                :src="activeCommunity.logo_url"
                :alt="activeCommunity.name"
                class="size-full object-cover"
              />
              <Users v-else class="size-5" />
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate text-base font-medium">
                {{ activeCommunity?.name || "Select Community" }}
              </span>
              <span class="truncate text-xs">{{
                activeCommunity ? getTierLabel(activeCommunity.tier) : ""
              }}</span>
            </div>
            <ChevronsUpDown class="ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-80 rounded-lg"
          align="start"
          :side="isMobile ? 'bottom' : 'right'"
          :side-offset="4"
        >
          <DropdownMenuLabel class="text-xs text-muted-foreground"> Communities </DropdownMenuLabel>
          <DropdownMenuItem
            v-for="(community, index) in communities"
            :key="community.id"
            class="gap-2 p-2"
            @click="selectCommunity(community)"
          >
            <div class="flex size-10 items-center justify-center rounded-sm border overflow-hidden">
              <img
                v-if="community.logo_url"
                :src="community.logo_url"
                :alt="community.name"
                class="size-full object-cover"
              />
              <Users v-else class="size-5 shrink-0" />
            </div>
            <div class="flex-1">
              <div class="font-medium">{{ community.name }}</div>
              <div class="text-xs text-muted-foreground">{{ community.member_count }} members</div>
            </div>
            <DropdownMenuShortcut>⌘{{ index + 1 }}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="gap-2 p-2" as-child>
            <NuxtLink to="/community/create">
              <div class="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus class="size-4" />
              </div>
              <div class="font-medium text-muted-foreground">Add/Join Community</div>
            </NuxtLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
