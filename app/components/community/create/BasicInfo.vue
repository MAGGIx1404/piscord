<template>
  <Card class="p-6">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Info class="size-5" />
        Basic Information
      </CardTitle>
      <CardDescription>
        Give your community a unique identity that members will recognize.
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <!-- Community Icon Upload -->
      <div class="space-y-2">
        <Label>Community Icon</Label>
        <div class="flex items-center gap-4">
          <div
            class="size-24 rounded-xl border-2 border-dashed border-input flex items-center justify-center cursor-pointer hover:border-primary transition-colors relative overflow-hidden group"
            @click="$emit('triggerIconUpload')"
          >
            <img v-if="iconPreview" :src="iconPreview" class="w-full h-full object-cover" />
            <div v-else class="flex flex-col items-center gap-1 text-muted-foreground">
              <ImagePlus class="size-6" />
              <span class="text-xs">Upload</span>
            </div>
            <div
              v-if="iconPreview"
              class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera class="size-6 text-white" />
            </div>
          </div>
          <div class="text-sm text-muted-foreground">
            <p>Recommended: 256x256px</p>
            <p>Max file size: 2MB</p>
          </div>
        </div>
      </div>

      <!-- Community Banner/Poster -->
      <div class="space-y-2">
        <Label>Community Banner</Label>
        <div
          class="w-full h-32 rounded-xl border-2 border-dashed border-input flex items-center justify-center cursor-pointer hover:border-primary transition-colors relative overflow-hidden group"
          @click="$emit('triggerBannerUpload')"
        >
          <img v-if="bannerPreview" :src="bannerPreview" class="w-full h-full object-cover" />
          <div v-else class="flex flex-col items-center gap-2 text-muted-foreground">
            <ImagePlus class="size-8" />
            <span class="text-sm">Upload banner image</span>
            <span class="text-xs">Recommended: 1200x400px</span>
          </div>
          <div
            v-if="bannerPreview"
            class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Camera class="size-8 text-white" />
          </div>
        </div>
        <p class="text-xs text-muted-foreground">Max file size: 4MB</p>
      </div>

      <div class="w-full grid grid-cols-2 gap-6">
        <!-- Community Name -->
        <div class="space-y-2">
          <Label for="name">Community Name <span class="text-destructive">*</span></Label>
          <Input
            id="name"
            :model-value="name"
            @update:model-value="$emit('update:name', String($event))"
            placeholder="Enter community name"
            maxlength="50"
          />
          <p class="text-xs text-muted-foreground">{{ name.length }}/50 characters</p>
        </div>

        <!-- Community URL -->
        <div class="space-y-2">
          <Label for="slug">Community URL</Label>
          <ButtonGroup class="gap-0! w-full h-10.5">
            <ButtonGroupText as-child>
              <Label for="url">piscord.com/c/</Label>
            </ButtonGroupText>
            <InputGroup class="h-full">
              <InputGroupInput
                id="slug"
                :model-value="slug"
                @update:model-value="$emit('update:slug', $event)"
                placeholder="your-community"
                :class="{ 'border-destructive': slugError }"
              />
              <InputGroupAddon align="inline-end">
                <Loader2 v-if="isCheckingSlug" class="size-4 animate-spin text-muted-foreground" />
                <CheckCircle2 v-else-if="slug && !slugError" class="size-4 text-green-500" />
                <XCircle v-else-if="slugError" class="size-4 text-destructive" />
                <Link2Icon v-else />
              </InputGroupAddon>
            </InputGroup>
          </ButtonGroup>
          <p v-if="slugError" class="text-xs text-destructive">{{ slugError }}</p>
          <p v-else class="text-xs text-muted-foreground">
            Only lowercase letters, numbers, and hyphens allowed.
          </p>
        </div>
      </div>

      <!-- Description -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <Label for="description">Description <span class="text-destructive">*</span></Label>
          <Button
            variant="ghost"
            size="sm"
            class="h-7 gap-1.5 text-primary hover:text-primary"
            @click="$emit('generateDescription')"
            :disabled="isGenerating || !name.trim()"
          >
            <Sparkles class="size-3.5" :class="{ 'animate-pulse': isGenerating }" />
            {{ isGenerating ? "Generating..." : "AI Generate" }}
          </Button>
        </div>
        <div class="relative">
          <Textarea
            id="description"
            :model-value="description"
            @update:model-value="$emit('update:description', String($event))"
            placeholder="Tell people what your community is about..."
            rows="4"
            maxlength="500"
            class="min-h-20"
            :disabled="isGenerating"
          />
          <div
            v-if="isGenerating"
            class="absolute inset-0 bg-background/50 rounded-md flex items-center justify-center"
          >
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 class="size-4 animate-spin" />
              <span>AI is writing...</span>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <p class="text-xs text-muted-foreground">{{ description.length }}/500 characters</p>
          <Tooltip v-if="name.trim()">
            <TooltipTrigger asChild>
              <button
                class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Wand2 class="size-3" />
                AI tips
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" class="max-w-xs">
              <p>
                Click "AI Generate" to create a description based on your community name and
                category.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import {
  Info,
  ImagePlus,
  Camera,
  Link2Icon,
  Sparkles,
  Loader2,
  Wand2,
  CheckCircle2,
  XCircle
} from "lucide-vue-next";

interface Props {
  name: string;
  slug: string;
  description: string;
  iconPreview?: string | null;
  bannerPreview?: string | null;
  isGenerating?: boolean;
  slugError?: string | null;
  isCheckingSlug?: boolean;
}

withDefaults(defineProps<Props>(), {
  iconPreview: null,
  bannerPreview: null,
  isGenerating: false,
  slugError: null,
  isCheckingSlug: false
});

defineEmits<{
  "update:name": [value: string];
  "update:slug": [value: string];
  "update:description": [value: string];
  triggerIconUpload: [];
  triggerBannerUpload: [];
  generateDescription: [];
}>();
</script>
