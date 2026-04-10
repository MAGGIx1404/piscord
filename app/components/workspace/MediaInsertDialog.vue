<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-lg gap-0 overflow-hidden p-0">
      <DialogHeader class="px-5 pt-5 pb-0">
        <DialogTitle class="text-base">Insert Image</DialogTitle>
        <DialogDescription class="text-xs text-muted-foreground">
          Add an image to your document
        </DialogDescription>
      </DialogHeader>

      <div class="px-5 pt-4 pb-5">
        <!-- Drop zone -->
        <div
          class="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors"
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
              {{ isDragging ? 'Drop your image here' : 'Drag & drop an image' }}
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
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ImageIcon, Upload, X, Plus, Eye } from "lucide-vue-next";

const open = defineModel<boolean>("open", { required: true });

const emit = defineEmits<{
  insertImage: [src: string];
}>();

const imageUrl = ref("");
const imagePreview = ref<string | null>(null);
const isDragging = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

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

watch(open, (val) => {
  if (!val) clearImage();
});
</script>
