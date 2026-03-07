<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">Let's give your community an identity</h2>
      <p class="text-muted-foreground">
        Start with the basics - a name, look, and description that represents your community.
      </p>
    </div>

    <!-- Icon & Banner -->
    <div class="flex items-start gap-6">
      <!-- Icon -->
      <div class="space-y-2">
        <Label class="text-xs tracking-wider text-muted-foreground uppercase">Icon</Label>
        <div
          class="group relative flex size-28 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card/50 transition-all duration-300 hover:border-primary/50"
          @click="triggerIconUpload"
        >
          <img v-if="iconPreview" :src="iconPreview" class="h-full w-full object-cover" />
          <div v-else class="flex flex-col items-center gap-2 text-muted-foreground">
            <div class="flex size-10 items-center justify-center rounded-xl bg-muted">
              <ImagePlus class="size-5" />
            </div>
            <span class="text-xs">Upload</span>
          </div>
          <div
            v-if="iconPreview"
            class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Camera class="size-6 text-white" />
          </div>
        </div>
      </div>

      <!-- Banner -->
      <div class="flex-1 space-y-2">
        <Label class="text-xs tracking-wider text-muted-foreground uppercase">Banner</Label>
        <div
          class="group relative flex h-28 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card/50 transition-all duration-300 hover:border-primary/50"
          @click="triggerBannerUpload"
        >
          <img v-if="bannerPreview" :src="bannerPreview" class="h-full w-full object-cover" />
          <div v-else class="flex flex-col items-center gap-2 text-muted-foreground">
            <ImagePlus class="size-6" />
            <span class="text-sm">Upload banner (1200×400)</span>
          </div>
          <div
            v-if="bannerPreview"
            class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Camera class="size-6 text-white" />
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden file inputs -->
    <input ref="iconInput" type="file" accept="image/*" class="hidden" @change="handleIconUpload" />
    <input
      ref="bannerInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleBannerUpload"
    />

    <!-- Name & Slug -->
    <div class="grid gap-6 md:grid-cols-2">
      <div class="space-y-2">
        <Label for="name" class="text-xs tracking-wider text-muted-foreground uppercase">
          Community Name <span class="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          v-model="communityName"
          placeholder="My Awesome Community"
          maxlength="50"
          class="h-12 text-lg"
        />
      </div>

      <div class="space-y-2">
        <Label for="slug" class="text-xs tracking-wider text-muted-foreground uppercase">URL</Label>
        <div class="relative">
          <span class="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
            piscord.com/c/
          </span>
          <Input
            id="slug"
            v-model="slug"
            placeholder="my-community"
            class="h-12 pl-28"
            :class="{ 'border-destructive focus-visible:ring-destructive': props.slugError }"
          />
          <div class="absolute top-1/2 right-3 -translate-y-1/2">
            <Loader2 v-if="isCheckingSlug" class="size-4 animate-spin text-muted-foreground" />
            <CheckCircle2 v-else-if="slug && !props.slugError" class="size-4 text-emerald-500" />
            <XCircle v-else-if="props.slugError" class="size-4 text-destructive" />
          </div>
        </div>
        <p v-if="props.slugError" class="text-xs text-destructive">{{ props.slugError }}</p>
      </div>
    </div>

    <!-- Description -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <Label for="description" class="text-xs tracking-wider text-muted-foreground uppercase">
          Description <span class="text-destructive">*</span>
        </Label>
      </div>
      <div class="relative">
        <Textarea
          id="description"
          v-model="description"
          placeholder="Tell people what your community is about, what they can expect, and why they should join..."
          rows="5"
          maxlength="500"
          class="min-h-32 resize-none"
        />
      </div>
      <p class="text-right text-xs text-muted-foreground">{{ description.length }}/500</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ImagePlus, Camera, Loader2, CheckCircle2, XCircle } from "lucide-vue-next";
import { toast } from "vue-sonner";

const communityName = defineModel<string>("name", { required: true });
const slug = defineModel<string>("slug", { required: true });
const description = defineModel<string>("description", { required: true });
const iconPreview = defineModel<string | null>("iconPreview", { required: true });
const bannerPreview = defineModel<string | null>("bannerPreview", { required: true });

const props = defineProps<{
  slugError: string | null;
  isCheckingSlug: boolean;
}>();

const emit = defineEmits<{
  (e: "update:iconFile", value: File | null): void;
  (e: "update:bannerFile", value: File | null): void;
}>();

const iconInput = ref<HTMLInputElement | null>(null);
const bannerInput = ref<HTMLInputElement | null>(null);

const triggerIconUpload = () => {
  iconInput.value?.click();
};

const handleIconUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }
    emit("update:iconFile", file);
    const reader = new FileReader();
    reader.onload = (e) => {
      iconPreview.value = (e.target?.result as string) || null;
    };
    reader.readAsDataURL(file);
  }
};

const triggerBannerUpload = () => {
  bannerInput.value?.click();
};

const handleBannerUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    if (file.size > 4 * 1024 * 1024) {
      toast.error("File size must be less than 4MB");
      return;
    }
    emit("update:bannerFile", file);
    const reader = new FileReader();
    reader.onload = (e) => {
      bannerPreview.value = (e.target?.result as string) || null;
    };
    reader.readAsDataURL(file);
  }
};
</script>
