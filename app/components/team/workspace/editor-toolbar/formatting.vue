<template>
  <div class="flex items-center gap-2">
    <TooltipProvider v-for="(btn, index) in buttons" :key="index">
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            size="icon"
            variant="ghost"
            @click="btn.event"
            :class="btn.isActive() ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''"
          >
            <component :is="btn.icon" class="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{{ btn.label }}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <Separator orientation="vertical" class="min-h-9" />
  </div>
</template>

<script setup lang="ts">
import { Bold, Italic, Underline, Strikethrough } from "lucide-vue-next";

const props = defineProps<{
  editor: any;
}>();

const buttons = computed(() => [
  {
    icon: Bold,
    label: "Bold",
    event: () => props.editor?.chain().focus().toggleBold().run(),
    isActive: () => props.editor?.isActive("bold")
  },
  {
    icon: Italic,
    label: "Italic",
    event: () => props.editor?.chain().focus().toggleItalic().run(),
    isActive: () => props.editor?.isActive("italic")
  },
  {
    icon: Underline,
    label: "Underline",
    event: () => props.editor?.chain().focus().toggleUnderline().run(),
    isActive: () => props.editor?.isActive("underline")
  },
  {
    icon: Strikethrough,
    label: "Strikethrough",
    event: () => props.editor?.chain().focus().toggleStrike().run(),
    isActive: () => props.editor?.isActive("strike")
  }
]);
</script>
