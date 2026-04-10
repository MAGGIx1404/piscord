<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-lg gap-0 overflow-hidden p-0">
      <DialogHeader class="px-5 pt-5 pb-0">
        <DialogTitle class="text-base">Insert Media</DialogTitle>
        <DialogDescription class="text-xs text-muted-foreground">
          Add an image or embed a video into your document
        </DialogDescription>
      </DialogHeader>

      <!-- Tabs -->
      <Tabs v-model="activeTab" class="mt-3">
        <TabsList class="mx-5 grid w-auto grid-cols-2">
          <TabsTrigger value="image" class="gap-1.5 text-xs">
            <ImageIcon class="size-3.5" />
            Image
          </TabsTrigger>
          <TabsTrigger value="embed" class="gap-1.5 text-xs">
            <Video class="size-3.5" />
            Embed Video
          </TabsTrigger>
        </TabsList>

        <!-- Image Tab -->
        <TabsContent value="image" class="px-5 pb-5">
          <!-- Drop zone -->
          <div
            class="relative mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors"
            :class="
              isDragging
                ? 'border-primary bg-primary/5'
                : imagePreview
                  ? 'border-border/50 bg-muted/20'
                  : 'border-border/40 bg-muted/10 hover:border-border/60'
            "
            @dragenter.prevent="isDragging = true"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
          >
            <!-- Preview -->
            <div v-if="imagePreview" class="relative w-full p-3">
              <img
                :src="imagePreview"
                alt="Preview"
                class="mx-auto max-h-48 rounded-lg object-contain"
              />
              <button
                class="absolute top-4 right-4 rounded-full bg-background/80 p-1 shadow-sm backdrop-blur-sm transition-colors hover:bg-destructive/10 hover:text-destructive"
                @click="clearImage"
              >
                <X class="size-3.5" />
              </button>
            </div>

            <!-- Upload prompt -->
            <div v-else class="flex flex-col items-center gap-2 py-10">
              <div class="rounded-full bg-muted/40 p-3">
                <Upload class="size-5 text-muted-foreground/50" />
              </div>
              <p class="text-sm font-medium text-muted-foreground/70">
                {{ isDragging ? "Drop your image here" : "Drag & drop an image" }}
              </p>
              <p class="text-[11px] text-muted-foreground/40">PNG, JPG, GIF, WebP up to 10 MB</p>
              <Button
                variant="outline"
                size="sm"
                class="mt-1 h-7 gap-1.5 px-3 text-xs"
                @click="triggerFileInput"
              >
                <ImageIcon class="size-3" />
                Browse files
              </Button>
            </div>
          </div>

          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileSelect"
          />

          <!-- OR divider -->
          <div class="my-3 flex items-center gap-3">
            <div class="h-px flex-1 bg-border/40" />
            <span class="text-[10px] font-medium tracking-wider text-muted-foreground/40 uppercase"
              >or paste URL</span
            >
            <div class="h-px flex-1 bg-border/40" />
          </div>

          <!-- URL input -->
          <div class="flex gap-2">
            <Input
              v-model="imageUrl"
              placeholder="https://example.com/image.png"
              class="h-8 text-xs"
              @keydown.enter="loadImageUrl"
            />
            <Button
              variant="secondary"
              size="sm"
              class="h-8 shrink-0 gap-1 px-3 text-xs"
              :disabled="!imageUrl.trim()"
              @click="loadImageUrl"
            >
              <Eye class="size-3" />
              Preview
            </Button>
          </div>

          <!-- Insert button -->
          <div class="mt-4 flex justify-end">
            <Button
              size="sm"
              class="h-8 gap-1.5 px-4 text-xs"
              :disabled="!imagePreview && !imageUrl.trim()"
              @click="insertImage"
            >
              <Plus class="size-3.5" />
              Insert Image
            </Button>
          </div>
        </TabsContent>

        <!-- Embed Tab -->
        <TabsContent value="embed" class="px-5 pb-5">
          <div class="mt-2 space-y-3">
            <!-- Supported platforms hint -->
            <div class="flex items-center gap-2 rounded-lg bg-muted/20 px-3 py-2">
              <Globe class="size-3.5 shrink-0 text-muted-foreground/50" />
              <p class="text-[11px] text-muted-foreground/60">
                Supports YouTube, Vimeo, Dailymotion, and other video platforms
              </p>
            </div>

            <!-- URL input -->
            <div class="flex gap-2">
              <Input
                v-model="embedUrl"
                placeholder="Paste video URL (YouTube, Vimeo, etc.)"
                class="h-9 text-xs"
                @keydown.enter="previewEmbed"
                @input="onEmbedInput"
              />
              <Button
                variant="secondary"
                size="sm"
                class="h-9 shrink-0 gap-1 px-3 text-xs"
                :disabled="!embedUrl.trim()"
                @click="previewEmbed"
              >
                <Eye class="size-3" />
                Preview
              </Button>
            </div>

            <!-- Platform detection badge -->
            <div v-if="detectedPlatform" class="flex items-center gap-1.5">
              <Badge variant="secondary" class="gap-1 text-[10px]">
                <component :is="platformIcon" class="size-3" />
                {{ detectedPlatform }}
              </Badge>
            </div>

            <!-- Embed preview -->
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
            >
              <div
                v-if="embedPreviewSrc"
                class="overflow-hidden rounded-xl border border-border/40 bg-black/5"
              >
                <div class="relative aspect-video w-full">
                  <iframe
                    :src="embedPreviewSrc"
                    class="absolute inset-0 size-full rounded-xl"
                    frameborder="0"
                    allow="
                      accelerometer;
                      autoplay;
                      clipboard-write;
                      encrypted-media;
                      gyroscope;
                      picture-in-picture;
                    "
                    allowfullscreen
                  />
                </div>
              </div>
            </Transition>

            <!-- Error -->
            <p v-if="embedError" class="flex items-center gap-1.5 text-xs text-destructive/80">
              <AlertCircle class="size-3" />
              {{ embedError }}
            </p>

            <!-- Insert button -->
            <div class="flex justify-end pt-1">
              <Button
                size="sm"
                class="h-8 gap-1.5 px-4 text-xs"
                :disabled="!embedPreviewSrc"
                @click="insertEmbed"
              >
                <Plus class="size-3.5" />
                Insert Video
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  ImageIcon,
  Video,
  Upload,
  X,
  Plus,
  Eye,
  Globe,
  AlertCircle,
  Youtube,
  Tv
} from "lucide-vue-next";

const open = defineModel<boolean>("open", { required: true });

const emit = defineEmits<{
  insertImage: [src: string];
  insertVideo: [src: string, embedSrc: string, platform: string];
}>();

const activeTab = ref<"image" | "embed">("image");

// ── Image state ──
const imageUrl = ref("");
const imagePreview = ref<string | null>(null);
const isDragging = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

// ── Embed state ──
const embedUrl = ref("");
const embedPreviewSrc = ref<string | null>(null);
const embedError = ref("");
const detectedPlatform = ref<string | null>(null);

const platformIcon = computed(() => {
  if (detectedPlatform.value === "YouTube") return Youtube;
  return Tv;
});

// ── Image methods ──
function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) readFile(file);
}

function handleDrop(e: DragEvent) {
  isDragging.value = false;
  const file = e.dataTransfer?.files[0];
  if (file && file.type.startsWith("image/")) {
    readFile(file);
  }
}

function readFile(file: File) {
  if (file.size > 10 * 1024 * 1024) return;
  const reader = new FileReader();
  reader.onload = () => {
    imagePreview.value = reader.result as string;
    imageUrl.value = "";
  };
  reader.readAsDataURL(file);
}

function loadImageUrl() {
  if (!imageUrl.value.trim()) return;
  imagePreview.value = imageUrl.value.trim();
}

function clearImage() {
  imagePreview.value = null;
  imageUrl.value = "";
  if (fileInputRef.value) fileInputRef.value.value = "";
}

function insertImage() {
  const src = imagePreview.value || imageUrl.value.trim();
  if (!src) return;
  emit("insertImage", src);
  clearImage();
  open.value = false;
}

// ── Embed methods ──
function parseVideoUrl(url: string): { platform: string; embedSrc: string } | null {
  const trimmed = url.trim();

  // YouTube
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  if (ytMatch) {
    return {
      platform: "YouTube",
      embedSrc: `https://www.youtube.com/embed/${ytMatch[1]}`
    };
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      platform: "Vimeo",
      embedSrc: `https://player.vimeo.com/video/${vimeoMatch[1]}`
    };
  }

  // Dailymotion
  const dmMatch = trimmed.match(/dailymotion\.com\/video\/([\w]+)/);
  if (dmMatch) {
    return {
      platform: "Dailymotion",
      embedSrc: `https://www.dailymotion.com/embed/video/${dmMatch[1]}`
    };
  }

  // Loom
  const loomMatch = trimmed.match(/loom\.com\/share\/([\w]+)/);
  if (loomMatch) {
    return {
      platform: "Loom",
      embedSrc: `https://www.loom.com/embed/${loomMatch[1]}`
    };
  }

  return null;
}

function onEmbedInput() {
  const parsed = parseVideoUrl(embedUrl.value);
  detectedPlatform.value = parsed?.platform ?? null;
  embedError.value = "";
}

function previewEmbed() {
  if (!embedUrl.value.trim()) return;
  const parsed = parseVideoUrl(embedUrl.value);
  if (parsed) {
    embedPreviewSrc.value = parsed.embedSrc;
    detectedPlatform.value = parsed.platform;
    embedError.value = "";
  } else {
    embedPreviewSrc.value = null;
    detectedPlatform.value = null;
    embedError.value = "Could not recognize this URL. Try YouTube, Vimeo, Dailymotion, or Loom.";
  }
}

function insertEmbed() {
  if (!embedPreviewSrc.value || !detectedPlatform.value) return;
  emit("insertVideo", embedUrl.value.trim(), embedPreviewSrc.value, detectedPlatform.value);
  embedUrl.value = "";
  embedPreviewSrc.value = null;
  detectedPlatform.value = null;
  embedError.value = "";
  open.value = false;
}

// Reset state when dialog closes
watch(open, (val) => {
  if (!val) {
    activeTab.value = "image";
    clearImage();
    embedUrl.value = "";
    embedPreviewSrc.value = null;
    detectedPlatform.value = null;
    embedError.value = "";
  }
});
</script>
