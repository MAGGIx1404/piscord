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
        <Label class="text-xs uppercase tracking-wider text-muted-foreground">Icon</Label>
        <div
          class="size-28 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden group bg-card/50"
          @click="triggerIconUpload"
        >
          <img v-if="iconPreview" :src="iconPreview" class="w-full h-full object-cover" />
          <div v-else class="flex flex-col items-center gap-2 text-muted-foreground">
            <div class="size-10 rounded-xl bg-muted flex items-center justify-center">
              <ImagePlus class="size-5" />
            </div>
            <span class="text-xs">Upload</span>
          </div>
          <div
            v-if="iconPreview"
            class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Camera class="size-6 text-white" />
          </div>
        </div>
      </div>

      <!-- Banner -->
      <div class="flex-1 space-y-2">
        <Label class="text-xs uppercase tracking-wider text-muted-foreground">Banner</Label>
        <div
          class="w-full h-28 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden group bg-card/50"
          @click="triggerBannerUpload"
        >
          <img v-if="bannerPreview" :src="bannerPreview" class="w-full h-full object-cover" />
          <div v-else class="flex flex-col items-center gap-2 text-muted-foreground">
            <ImagePlus class="size-6" />
            <span class="text-sm">Upload banner (1200×400)</span>
          </div>
          <div
            v-if="bannerPreview"
            class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-2">
        <Label for="name" class="text-xs uppercase tracking-wider text-muted-foreground">
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
        <Label for="slug" class="text-xs uppercase tracking-wider text-muted-foreground">URL</Label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            piscord.com/c/
          </span>
          <Input
            id="slug"
            v-model="slug"
            placeholder="my-community"
            class="h-12 pl-28"
            :class="{ 'border-destructive focus-visible:ring-destructive': props.slugError }"
          />
          <div class="absolute right-3 top-1/2 -translate-y-1/2">
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
        <Label for="description" class="text-xs uppercase tracking-wider text-muted-foreground">
          Description <span class="text-destructive">*</span>
        </Label>
        <Button
          variant="ghost"
          size="sm"
          class="h-7 gap-1.5 text-primary hover:text-primary"
          @click="emit('generate-description')"
          :disabled="isGenerating || !communityName.trim()"
        >
          <Sparkles class="size-3.5" :class="{ 'animate-pulse': isGenerating }" />
          {{ isGenerating ? "Writing..." : "AI Generate" }}
        </Button>
      </div>
      <div class="relative">
        <Textarea
          id="description"
          v-model="description"
          placeholder="Tell people what your community is about, what they can expect, and why they should join..."
          rows="5"
          maxlength="500"
          class="resize-none min-h-32"
          :disabled="isGenerating"
        />
        <div
          v-if="isGenerating"
          class="absolute inset-0 bg-background/50 rounded-md flex items-center justify-center backdrop-blur-sm"
        >
          <div class="flex items-center gap-2 text-sm text-primary">
            <Loader2 class="size-4 animate-spin" />
            <span>AI is crafting your description...</span>
          </div>
        </div>
      </div>
      <p class="text-xs text-muted-foreground text-right">{{ description.length }}/500</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ImagePlus, Camera, Loader2, CheckCircle2, XCircle, Sparkles } from "lucide-vue-next";
import { toast } from "vue-sonner";

const communityName = defineModel<string>("name", { required: true });
const slug = defineModel<string>("slug", { required: true });
const description = defineModel<string>("description", { required: true });
const iconPreview = defineModel<string | null>("iconPreview", { required: true });
const bannerPreview = defineModel<string | null>("bannerPreview", { required: true });

const props = defineProps<{
  slugError: string | null;
  isCheckingSlug: boolean;
  isGenerating: boolean;
}>();

const emit = defineEmits<{
  (e: "update:iconFile", value: File | null): void;
  (e: "update:bannerFile", value: File | null): void;
  (e: "generate-description"): void;
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
