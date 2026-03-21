<template>
  <Dialog v-model:open="model">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Create Channel</DialogTitle>
        <DialogDescription>Add a new channel to this community.</DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-4 py-2">
        <!-- Banner preview / upload -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">
            Banner <span class="text-muted-foreground">(optional)</span>
          </label>
          <div
            class="group relative h-32 w-full cursor-pointer overflow-hidden rounded-xl border border-dashed border-border/60 transition-colors hover:border-border"
            @click="bannerInput?.click()"
          >
            <img
              v-if="bannerPreview"
              :src="bannerPreview"
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
            <!-- Remove button -->
            <button
              v-if="bannerPreview"
              class="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:text-destructive"
              @click.stop="removeBanner"
            >
              <X class="size-3.5" />
            </button>
          </div>
          <input
            ref="bannerInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            @change="handleBannerSelect"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Name</label>
          <Input v-model="form.name" placeholder="general" maxlength="100" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Type</label>
          <Select v-model="form.type">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="voice">Voice</SelectItem>
              <SelectItem value="announcement">Announcement</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div v-if="form.type !== 'category'" class="flex flex-col gap-2">
          <label class="text-sm font-medium">
            Topic <span class="text-muted-foreground">(optional)</span>
          </label>
          <Input v-model="form.topic" placeholder="What's this channel about?" />
        </div>

        <div v-if="form.type !== 'category'" class="flex flex-col gap-2">
          <label class="text-sm font-medium">
            Description <span class="text-muted-foreground">(optional)</span>
          </label>
          <Input v-model="form.description" placeholder="A brief description of this channel" />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="model = false">Cancel</Button>
        <Button :disabled="!form.name.trim() || creating" @click="handleCreate">
          <span
            v-if="creating"
            class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          <template v-else>Create</template>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ImagePlus, X } from "lucide-vue-next";
import { toast } from "vue-sonner";

const props = defineProps<{
  communityId: string;
  defaultType?: string;
}>();

const emit = defineEmits<{
  created: [];
}>();

const model = defineModel<boolean>({ required: true });

const api = useApi();
const creating = ref(false);
const bannerInput = ref<HTMLInputElement | null>(null);
const bannerPreview = ref<string | null>(null);
const bannerFile = ref<File | null>(null);

const form = reactive({
  name: "",
  type: props.defaultType ?? "text",
  topic: "",
  description: ""
});

watch(
  () => props.defaultType,
  (val) => {
    if (val) form.type = val;
  }
);

watch(model, (open) => {
  if (open) {
    form.name = "";
    form.type = props.defaultType ?? "text";
    form.topic = "";
    form.description = "";
    bannerPreview.value = null;
    bannerFile.value = null;
  }
});

function handleBannerSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 8 * 1024 * 1024) {
    toast.error("Banner image must be under 8MB");
    return;
  }
  bannerFile.value = file;
  const reader = new FileReader();
  reader.onload = () => {
    bannerPreview.value = reader.result as string;
  };
  reader.readAsDataURL(file);
}

function removeBanner() {
  bannerPreview.value = null;
  bannerFile.value = null;
  if (bannerInput.value) bannerInput.value.value = "";
}

async function handleCreate() {
  if (!form.name.trim()) return;
  creating.value = true;
  try {
    // If banner file selected, upload it first
    let bannerUrl: string | undefined;
    if (bannerFile.value) {
      const fd = new FormData();
      fd.append("file", bannerFile.value);
      fd.append("kind", "channel-banner");
      fd.append("community_id", props.communityId);
      const res = await api<{ url: string }>("/api/upload", {
        method: "POST",
        body: fd
      });
      bannerUrl = res.url;
    }

    await api(`/api/communities/${props.communityId}/channels`, {
      method: "POST",
      body: {
        name: form.name.trim(),
        type: form.type,
        topic: form.topic.trim() || undefined,
        description: form.description.trim() || undefined,
        banner_url: bannerUrl
      }
    });
    toast.success("Channel created!");
    model.value = false;
    emit("created");
  } catch (err: any) {
    toast.error(err?.data?.message ?? "Failed to create channel");
  } finally {
    creating.value = false;
  }
}
</script>
