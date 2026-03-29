<template>
  <main class="mx-auto w-full max-w-4xl px-6 pt-8 pb-24">
    <div class="mb-8 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          class="grid size-9 place-items-center rounded-xl border border-border/60 bg-card transition-colors hover:bg-accent"
          @click="router.push(`/community/${communityId}`)"
        >
          <ArrowLeft class="size-4 text-muted-foreground" />
        </button>
        <div>
          <h1 class="text-xl font-bold">Workspaces</h1>
          <p class="text-sm text-muted-foreground">
            <template v-if="!pending">
              {{ workspaces.length }} workspace{{ workspaces.length !== 1 ? "s" : "" }}
            </template>
            <template v-else>&nbsp;</template>
          </p>
        </div>
      </div>

      <Button v-if="canManage" size="sm" class="gap-1.5" @click="showCreateDialog = true">
        <Plus class="size-4" />
        Create Workspace
      </Button>
    </div>

    <div v-if="pending" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div
        v-for="n in 4"
        :key="n"
        class="overflow-hidden rounded-2xl border border-border/50 bg-card"
      >
        <div class="h-32 w-full animate-pulse bg-muted/40" />
        <div class="p-5">
          <div class="flex items-start gap-3">
            <div class="size-11 shrink-0 animate-pulse rounded-xl bg-muted/40" />
            <div class="min-w-0 flex-1 space-y-2">
              <div class="h-4 w-2/3 animate-pulse rounded bg-muted/50" />
              <div class="h-3 w-full animate-pulse rounded bg-muted/30" />
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between border-t border-border/30 pt-3">
            <div class="h-3 w-28 animate-pulse rounded bg-muted/30" />
            <div class="size-4 animate-pulse rounded bg-muted/30" />
          </div>
        </div>
      </div>
    </div>

    <template v-else>
      <div v-if="workspaces.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div
          v-for="workspace in workspaces"
          :key="workspace.id"
          class="group cursor-pointer overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-border hover:shadow-lg hover:shadow-black/5"
          @click="router.push(`/community/${communityId}/workspaces/${workspace.id}`)"
        >
          <div class="p-5">
            <div class="flex items-start gap-3">
              <div
                class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10"
              >
                <span v-if="workspace.emoji" class="text-lg">{{ workspace.emoji }}</span>
                <Layers v-else class="size-5 text-primary" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="truncate font-medium transition-colors group-hover:text-primary">
                    {{ workspace.name }}
                  </p>
                  <Badge v-if="!workspace.is_public" variant="secondary" class="text-[10px]">
                    Private
                  </Badge>
                </div>
                <p
                  v-if="workspace.description"
                  class="mt-1 line-clamp-2 text-sm text-muted-foreground"
                >
                  {{ workspace.description }}
                </p>
                <p v-else class="mt-1 text-sm text-muted-foreground/50">No description</p>
              </div>
            </div>
            <div class="mt-3 flex items-center justify-between border-t border-border/30 pt-3">
              <span class="text-xs text-muted-foreground">
                Created {{ formatDate(workspace.created_at) }}
              </span>
              <ChevronRight
                class="size-4 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="relative overflow-hidden rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-20"
      >
        <div class="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
          <div
            v-for="i in 12"
            :key="i"
            class="absolute size-1 rounded-full bg-primary/40"
            :style="{
              top: `${(i % 4) * 28 + 8}%`,
              left: `${Math.floor(i / 4) * 34 + 6}%`
            }"
          />
        </div>
        <div class="relative flex flex-col items-center">
          <div
            class="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/20"
          >
            <Layers class="size-7 text-primary" />
          </div>
          <p class="text-base font-medium text-foreground/80">No workspaces yet</p>
          <p class="mt-1 text-center text-sm text-muted-foreground">
            Workspaces are collaborative docs and pages.
            <template v-if="canManage">Create the first one to get started.</template>
          </p>
          <Button
            v-if="canManage"
            size="sm"
            variant="outline"
            class="mt-5 gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
            @click="showCreateDialog = true"
          >
            <Plus class="size-3.5" />
            Create a workspace
          </Button>
        </div>
      </div>
    </template>

    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>Add a new workspace to this community.</DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-2">
          <div class="space-y-2">
            <label class="text-sm font-medium">
              Banner <span class="text-muted-foreground">(optional)</span>
            </label>
            <div
              class="group relative h-32 w-full cursor-pointer overflow-hidden rounded-xl border border-dashed border-border/60 transition-colors hover:border-border"
              @click="wsBannerInput?.click()"
            >
              <img
                v-if="wsBannerPreview"
                :src="wsBannerPreview"
                alt="Banner preview"
                class="size-full object-cover"
              />
              <div
                v-else
                class="flex size-full flex-col items-center justify-center gap-1.5 text-muted-foreground/50"
              >
                <ImagePlus class="size-6" />
                <span class="text-xs">Click to add banner image</span>
              </div>
              <button
                v-if="wsBannerPreview"
                class="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:text-destructive"
                @click.stop="removeWsBanner"
              >
                <X class="size-3.5" />
              </button>
            </div>
            <input
              ref="wsBannerInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="hidden"
              @change="handleWsBannerSelect"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Name</label>
            <Input v-model="createForm.name" placeholder="Design docs" maxlength="100" />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">
              Emoji <span class="text-muted-foreground">(optional)</span>
            </label>
            <Input v-model="createForm.emoji" placeholder="" maxlength="4" class="w-20" />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">
              Description <span class="text-muted-foreground">(optional)</span>
            </label>
            <Input v-model="createForm.description" placeholder="What's this workspace for?" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showCreateDialog = false">Cancel</Button>
          <Button :disabled="!createForm.name.trim() || creating" @click="handleCreate">
            <span
              v-if="creating"
              class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
            <template v-else>Create</template>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </main>
</template>

<script setup lang="ts">
import { Layers, ChevronRight, Plus, ArrowLeft, ImagePlus, X } from "lucide-vue-next";
import { toast } from "vue-sonner";

const route = useRoute();
const router = useRouter();
const api = useApi();
const communityId = route.params.community_id as string;

interface WorkspaceItem {
  id: string;
  name: string;
  emoji: string | null;
  description: string | null;
  banner_url: string | null;
  is_public: boolean;
  created_by: string;
  created_at: string;
}

interface WorkspacesResponse {
  workspaces: WorkspaceItem[];
  can_manage: boolean;
}

const { data, pending, refresh } = await useAsyncData<WorkspacesResponse>(
  `community-workspaces-${communityId}`,
  () => api<WorkspacesResponse>(`/api/communities/${communityId}/workspaces`)
);

const workspaces = computed(() => data.value?.workspaces ?? []);
const canManage = computed(() => data.value?.can_manage ?? false);

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const showCreateDialog = ref(false);
const creating = ref(false);
const wsBannerInput = ref<HTMLInputElement | null>(null);
const wsBannerPreview = ref<string | null>(null);
const wsBannerFile = ref<File | null>(null);

const createForm = reactive({
  name: "",
  emoji: "",
  description: ""
});

function handleWsBannerSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 8 * 1024 * 1024) {
    toast.error("Banner image must be under 8MB");
    return;
  }
  wsBannerFile.value = file;
  const reader = new FileReader();
  reader.onload = () => {
    wsBannerPreview.value = reader.result as string;
  };
  reader.readAsDataURL(file);
}

function removeWsBanner() {
  wsBannerPreview.value = null;
  wsBannerFile.value = null;
  if (wsBannerInput.value) wsBannerInput.value.value = "";
}

async function handleCreate() {
  if (!createForm.name.trim()) return;
  creating.value = true;
  try {
    let bannerUrl: string | undefined;
    if (wsBannerFile.value) {
      const fd = new FormData();
      fd.append("file", wsBannerFile.value);
      const res = await api<{ url: string }>("/api/upload", {
        method: "POST",
        body: fd
      });
      bannerUrl = res.url;
    }

    await api(`/api/communities/${communityId}/workspaces`, {
      method: "POST",
      body: {
        name: createForm.name.trim(),
        emoji: createForm.emoji.trim() || undefined,
        description: createForm.description.trim() || undefined,
        banner_url: bannerUrl
      }
    });
    toast.success("Workspace created!");
    showCreateDialog.value = false;
    createForm.name = "";
    createForm.emoji = "";
    createForm.description = "";
    wsBannerPreview.value = null;
    wsBannerFile.value = null;
    await refresh();
  } catch (err: any) {
    toast.error(err?.data?.message ?? "Failed to create workspace");
  } finally {
    creating.value = false;
  }
}

const communityStore = useCommunityStore();
communityStore.setCurrentCommunity(communityId);
</script>
