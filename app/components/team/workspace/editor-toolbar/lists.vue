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
import { LayoutList, ListOrdered, Quote } from "lucide-vue-next";

const props = defineProps<{
  editor: any;
}>();

const buttons = computed(() => [
  {
    icon: LayoutList,
    label: "Bullet List",
    event: () => props.editor?.chain().focus().toggleBulletList().run(),
    isActive: () => props.editor?.isActive("bulletList")
  },
  {
    icon: ListOrdered,
    label: "Ordered List",
    event: () => props.editor?.chain().focus().toggleOrderedList().run(),
    isActive: () => props.editor?.isActive("orderedList")
  },
  {
    icon: Quote,
    label: "Blockquote",
    event: () => props.editor?.chain().focus().toggleBlockquote().run(),
    isActive: () => props.editor?.isActive("blockquote")
  }
]);
</script>
