<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon
} from "lucide-vue-next";
import { Toaster as Sonner } from "vue-sonner";
import { cn } from "@/lib/utils";

const props = defineProps<ToasterProps>();
</script>

<template>
  <Sonner
    v-bind="props"
    :toast-options="{
      unstyled: true,
      classes: {
        toast:
          'w-full p-4 flex rounded-lg items-center justify-start gap-4 shadow-lg border-4 border-black',
        description: 'text-red-400',
        actionButton: 'bg-zinc-400',
        cancelButton: 'bg-orange-400',
        closeButton: 'bg-lime-400',
        error: 'bg-red-400',
        success: 'bg-green-400',
        warning: 'bg-yellow-400',
        info: 'bg-blue-400',
        loading: 'bg-white'
      }
    }"
  >
    <template #success-icon>
      <CircleCheckIcon class="size-8" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-8" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="size-8" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-8" />
    </template>
    <template #loading-icon>
      <div>
        <Loader2Icon class="size-8 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <XIcon class="size-8" />
    </template>
  </Sonner>
</template>
