<template>
  <main class="w-full h-full flex items-center justify-center p-6">
    <div class="w-full max-w-4xl space-y-10">
      <!-- Welcome Hero -->
      <div class="text-center space-y-4">
        <h1 class="text-4xl md:text-5xl font-bold">
          Welcome to <span class="text-primary">Piscord</span>
        </h1>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with communities, share ideas, and collaborate with like-minded people. Join or
          create a community to unlock all features.
        </p>
      </div>

      <!-- Action Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Join Community Card -->
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

        <!-- Create Community Card -->
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

            <!-- Features List -->
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

      <!-- Quick Tips -->
      <Card class="p-6 bg-muted/30">
        <div class="flex items-start gap-4">
          <div class="size-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
            <Lightbulb class="size-5 text-amber-500" />
          </div>
          <div class="space-y-1">
            <h3 class="font-medium">Quick Tip</h3>
            <p class="text-sm text-muted-foreground">
              Not sure where to start? Browse our
              <NuxtLink to="/discover" class="text-primary hover:underline">Discover page</NuxtLink>
              to find popular communities in gaming, technology, art, music, and more. You can join
              public communities instantly or request to join private ones.
            </p>
          </div>
        </div>
      </Card>
    </div>
  </main>
</template>

<script setup>
import {
  Users,
  Plus,
  Link2,
  ArrowRight,
  Compass,
  CheckCircle,
  Sparkles,
  Lightbulb
} from "lucide-vue-next";

const router = useRouter();
const inviteLink = ref("");

const handleJoinWithLink = () => {
  if (!inviteLink.value.trim()) return;

  const code = inviteLink.value.includes("/invite/")
    ? inviteLink.value.split("/invite/").pop()
    : inviteLink.value;

  router.push(`/invite/${code}`);
};
</script>
