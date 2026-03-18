<template>
  <main class="mx-auto w-full max-w-4xl px-6 pt-8 pb-24">
    <!-- Loading -->
    <div v-if="pending" class="flex h-96 items-center justify-center">
      <div class="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>

    <template v-else>
      <!-- Header -->
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
              {{ workspaces.length }} workspace{{ workspaces.length !== 1 ? "s" : "" }}
            </p>
          </div>
        </div>

        <Button v-if="canManage" size="sm" class="gap-1.5" @click="showCreateDialog = true">
          <Plus class="size-4" />
          Create Workspace
        </Button>
      </div>

      <!-- Workspace list -->
      <div v-if="workspaces.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div
          v-for="workspace in workspaces"
          :key="workspace.id"
          class="group cursor-pointer rounded-2xl border border-border/50 bg-card p-5 transition-all hover:border-border hover:shadow-lg hover:shadow-black/5"
          @click="router.push(`/community/${communityId}/workspaces/${workspace.id}`)"
        >
          <div class="flex items-start gap-3">
            <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
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

      <!-- Empty state -->
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

    <!-- Create Workspace Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>Add a new workspace to this community.</DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-2">
          <div class="space-y-2">
            <label class="text-sm font-medium">Name</label>
            <Input v-model="createForm.name" placeholder="Design docs" maxlength="100" />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium"
              >Emoji <span class="text-muted-foreground">(optional)</span></label
            >
            <Input v-model="createForm.emoji" placeholder="📝" maxlength="4" class="w-20" />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium"
              >Description <span class="text-muted-foreground">(optional)</span></label
            >
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
import { Layers, ChevronRight, Plus, ArrowLeft } from "lucide-vue-next";
import { toast } from "vue-sonner";

const route = useRoute();
const router = useRouter();
const api = useApi();
const communityId = route.params.community_id as string;

// ─── Types ───────────────────────────────────────────────────────────────────

interface WorkspaceItem {
  id: string;
  name: string;
  emoji: string | null;
  description: string | null;
  is_public: boolean;
  created_by: string;
  created_at: string;
}

interface WorkspacesResponse {
  workspaces: WorkspaceItem[];
  can_manage: boolean;
}

// ─── Fetch workspaces ────────────────────────────────────────────────────────

const { data, pending, refresh } = await useAsyncData<WorkspacesResponse>(
  `community-workspaces-${communityId}`,
  () => api<WorkspacesResponse>(`/api/communities/${communityId}/workspaces`)
);

const workspaces = computed(() => data.value?.workspaces ?? []);
const canManage = computed(() => data.value?.can_manage ?? false);

// ─── Format date ─────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Create workspace ────────────────────────────────────────────────────────

const showCreateDialog = ref(false);
const creating = ref(false);
const createForm = reactive({
  name: "",
  emoji: "",
  description: ""
});

async function handleCreate() {
  if (!createForm.name.trim()) return;
  creating.value = true;
  try {
    await api(`/api/communities/${communityId}/workspaces`, {
      method: "POST",
      body: {
        name: createForm.name.trim(),
        emoji: createForm.emoji.trim() || undefined,
        description: createForm.description.trim() || undefined
      }
    });
    toast.success("Workspace created!");
    showCreateDialog.value = false;
    createForm.name = "";
    createForm.emoji = "";
    createForm.description = "";
    await refresh();
  } catch (err: any) {
    toast.error(err?.data?.message ?? "Failed to create workspace");
  } finally {
    creating.value = false;
  }
}

// ─── Sync community store ───────────────────────────────────────────────────

const communityStore = useCommunityStore();
communityStore.setCurrentCommunity(communityId);
</script>
