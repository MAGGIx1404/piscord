<template>
  <div class="flex items-center gap-2">
    <TooltipProvider v-for="(btn, index) in buttons" :key="index">
      <Tooltip>
        <TooltipTrigger as-child>
          <Button size="icon" variant="ghost" @click="btn.event" :disabled="btn.disabled()">
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
import { RotateCcw, RotateCw } from "lucide-vue-next";

const props = defineProps<{
  editor: any;
}>();

const buttons = computed(() => [
  {
    icon: RotateCcw,
    label: "Undo",
    event: () => props.editor?.chain().focus().undo().run(),
    disabled: () => !props.editor?.can().chain().focus().undo().run()
  },
  {
    icon: RotateCw,
    label: "Redo",
    event: () => props.editor?.chain().focus().redo().run(),
    disabled: () => !props.editor?.can().chain().focus().redo().run()
  }
]);
</script>
