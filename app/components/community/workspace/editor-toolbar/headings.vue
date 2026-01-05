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
            <component :is="btn.icon" class="size-5" />
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
import { Heading1, Heading2, Heading3, Heading4, Heading5, Heading6 } from "lucide-vue-next";

const props = defineProps<{
  editor: any;
}>();

const buttons = computed(() => [
  {
    icon: Heading1,
    label: "Heading 1",
    event: () => props.editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: () => props.editor?.isActive("heading", { level: 1 })
  },
  {
    icon: Heading2,
    label: "Heading 2",
    event: () => props.editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: () => props.editor?.isActive("heading", { level: 2 })
  },
  {
    icon: Heading3,
    label: "Heading 3",
    event: () => props.editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: () => props.editor?.isActive("heading", { level: 3 })
  },
  {
    icon: Heading4,
    label: "Heading 4",
    event: () => props.editor?.chain().focus().toggleHeading({ level: 4 }).run(),
    isActive: () => props.editor?.isActive("heading", { level: 4 })
  },
  {
    icon: Heading5,
    label: "Heading 5",
    event: () => props.editor?.chain().focus().toggleHeading({ level: 5 }).run(),
    isActive: () => props.editor?.isActive("heading", { level: 5 })
  },
  {
    icon: Heading6,
    label: "Heading 6",
    event: () => props.editor?.chain().focus().toggleHeading({ level: 6 }).run(),
    isActive: () => props.editor?.isActive("heading", { level: 6 })
  }
]);
</script>
