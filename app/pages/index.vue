<template>
  <main class="w-full h-full flex items-center justify-center p-6">
    <div v-if="communityStore.isLoading" class="flex items-center justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="communityStore.hasCommunities" class="w-full max-w-6xl space-y-6">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold">Welcome back, {{ userStore.user?.first_name }}!</h1>
        <p class="text-muted-foreground">Select a community from the sidebar to get started.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          v-for="community in communityStore.communities"
          :key="community.id"
          class="p-4 hover:border-primary/50 transition-colors cursor-pointer group"
          @click="navigateToCommunity(community.slug)"
        >
          <div class="flex items-start gap-4">
            <div
              class="size-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0"
            >
              <img
                v-if="community.logo_url"
                :src="community.logo_url"
                :alt="community.name"
                class="size-full object-cover"
              />
              <Users v-else class="size-7 text-muted-foreground" />
            </div>
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-center gap-2">
                <h3 class="font-semibold truncate group-hover:text-primary transition-colors">
                  {{ community.name }}
                </h3>
                <Badge v-if="community.is_verified" variant="secondary" class="shrink-0">
                  <CheckCircle class="size-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <p class="text-sm text-muted-foreground line-clamp-2">
                {{ community.description || "No description" }}
              </p>
              <div class="flex items-center gap-3 text-xs text-muted-foreground">
                <span class="flex items-center gap-1">
                  <Users class="size-3" />
                  {{ community.member_count }} members
                </span>
                <Badge variant="outline" class="text-xs">{{ community.role }}</Badge>
              </div>
            </div>
            <ArrowRight
              class="size-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0"
            />
          </div>
        </Card>
      </div>

      <div class="flex items-center gap-3">
        <Separator class="flex-1" />
        <span class="text-xs text-muted-foreground">or</span>
        <Separator class="flex-1" />
      </div>

      <div class="flex flex-wrap gap-3">
        <Button variant="outline" as-child>
          <NuxtLink to="/discover">
            <Compass class="size-4" />
            Discover More Communities
          </NuxtLink>
        </Button>
        <Button variant="outline" as-child>
          <NuxtLink to="/community/create">
            <Plus class="size-4" />
            Create New Community
          </NuxtLink>
        </Button>
      </div>
    </div>

    <div v-else class="w-full max-w-4xl space-y-10">
      <HomeBanner />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card class="p-6 hover:border-primary/50 transition-colors">
          <div class="space-y-4">
            <div class="size-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users class="size-7 text-blue-500" />
            </div>
            <div>
              <h2 class="text-xl font-semibold mb-2">Join a Community</h2>
              <p class="text-sm text-muted-foreground">
                Find and join communities that match your interests. Connect with others who share
                your passions.
              </p>
            </div>

            <Separator />

            <!-- Invitation Link Option -->
            <div class="space-y-3">
              <Label class="flex items-center gap-2 text-sm font-medium">
                <Link2 class="size-4" />
                Have an invitation link?
              </Label>
              <div class="flex gap-2">
                <Input
                  v-model="inviteLink"
                  placeholder="Paste invite link here..."
                  class="flex-1"
                />
                <Button class="h-auto" @click="handleJoinWithLink" :disabled="!inviteLink.trim()">
                  <ArrowRight class="size-4" />
                </Button>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <Separator class="flex-1" />
              <span class="text-xs text-muted-foreground">or</span>
              <Separator class="flex-1" />
            </div>

            <!-- Discover Communities -->
            <Button variant="outline" class="w-full" as-child>
              <NuxtLink to="/discover">
                <Compass class="size-4" />
                Discover Public Communities
                <ArrowRight class="size-4 ml-auto" />
              </NuxtLink>
            </Button>
          </div>
        </Card>

        <Card class="p-6 hover:border-primary/50 transition-colors">
          <div class="space-y-4">
            <div class="size-14 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Plus class="size-7 text-green-500" />
            </div>
            <div>
              <h2 class="text-xl font-semibold mb-2">Create Your Community</h2>
              <p class="text-sm text-muted-foreground">
                Build your own space for your team, friends, or audience. Customize it your way and
                invite others to join.
              </p>
            </div>

            <Separator />

            <div class="space-y-2">
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle class="size-4 text-green-500" />
                <span>Create channels and workspaces</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle class="size-4 text-green-500" />
                <span>Manage members and roles</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle class="size-4 text-green-500" />
                <span>Customize with your branding</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle class="size-4 text-green-500" />
                <span>Public or private visibility</span>
              </div>
            </div>

            <Button class="w-full" as-child>
              <NuxtLink to="/community/create">
                <Sparkles class="size-4" />
                Create Community
                <ArrowRight class="size-4 ml-auto" />
              </NuxtLink>
            </Button>
          </div>
        </Card>
      </div>

      <QuickTip />
    </div>
  </main>
</template>

<script setup lang="ts">
import { Users, Plus, Link2, ArrowRight, Compass, CheckCircle, Sparkles } from "lucide-vue-next";

const router = useRouter();
const userStore = useUserStore();
const communityStore = useCommunityStore();

const inviteLink = ref("");

const handleJoinWithLink = () => {
  if (!inviteLink.value.trim()) return;

  const code = inviteLink.value.includes("/invite/")
    ? inviteLink.value.split("/invite/").pop()
    : inviteLink.value;

  router.push(`/invite/${code}`);
};

const navigateToCommunity = (slug: string) => {
  communityStore.setCurrentCommunity(slug);
  router.push(`/community/${slug}`);
};
</script>
