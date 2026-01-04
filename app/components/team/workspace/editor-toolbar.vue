<template>
  <div
    class="w-full border flex items-center gap-2 p-2 border-b flex-wrap bg-background sticky top-16 z-3 rounded-t-md"
  >
    <div
      v-for="(group, groupIndex) in toolbarButtons"
      :key="`group-${groupIndex}`"
      class="flex items-center gap-2"
    >
      <TooltipProvider v-for="(btn, btnIndex) in group" :key="`btn-${btnIndex}`">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              size="icon"
              variant="ghost"
              @click="btn.event"
              :disabled="btn.disabled ? btn.disabled() : false"
              :class="
                btn.isActive && btn.isActive()
                  ? 'bg-primary/10 text-primary hover:bg-primary/20'
                  : ''
              "
            >
              <component :is="btn.icon" :class="btn.class || 'size-4'" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {{ btn.label.charAt(0).toUpperCase() + btn.label.slice(1) }}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Separator
        v-if="groupIndex < toolbarButtons.length - 1"
        orientation="vertical"
        class="min-h-9"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  RotateCcw,
  RotateCw,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  LayoutList,
  ListOrdered,
  Link,
  Image,
  Quote,
  Table,
  Film,
  Minus
} from "lucide-vue-next";

const props = defineProps<{
  editorInstance: any;
}>();

const toolbarButtons: Array<
  Array<{
    icon: any;
    label: string;
    class?: string;
    event: () => void;
    disabled?: () => boolean;
    action?: string;
    isActive?: () => boolean;
  }>
> = [
  [
    {
      icon: RotateCcw,
      label: "undo",
      event: () => props.editorInstance?.chain().focus().undo().run(),
      disabled: () => !props.editorInstance?.can().chain().focus().undo().run()
    },
    {
      icon: RotateCw,
      label: "redo",
      event: () => props.editorInstance?.chain().focus().redo().run(),
      disabled: () => !props.editorInstance?.can().chain().focus().redo().run()
    }
  ],
  [
    {
      icon: Heading1,
      label: "heading1",
      class: "size-5",
      event: () => props.editorInstance?.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => props.editorInstance?.isActive("heading", { level: 1 })
    },
    {
      icon: Heading2,
      label: "heading2",
      class: "size-5",
      event: () => props.editorInstance?.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => props.editorInstance?.isActive("heading", { level: 2 })
    },
    {
      icon: Heading3,
      label: "heading3",
      class: "size-5",
      event: () => props.editorInstance?.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => props.editorInstance?.isActive("heading", { level: 3 })
    },
    {
      icon: Heading4,
      label: "heading4",
      class: "size-5",
      event: () => props.editorInstance?.chain().focus().toggleHeading({ level: 4 }).run(),
      isActive: () => props.editorInstance?.isActive("heading", { level: 4 })
    },
    {
      icon: Heading5,
      label: "heading5",
      class: "size-5",
      event: () => props.editorInstance?.chain().focus().toggleHeading({ level: 5 }).run(),
      isActive: () => props.editorInstance?.isActive("heading", { level: 5 })
    },
    {
      icon: Heading6,
      label: "heading6",
      class: "size-5",
      event: () => props.editorInstance?.chain().focus().toggleHeading({ level: 6 }).run(),
      isActive: () => props.editorInstance?.isActive("heading", { level: 6 })
    }
  ],
  [
    {
      icon: Bold,
      label: "bold",
      event: () => props.editorInstance?.chain().focus().toggleBold().run(),
      isActive: () => props.editorInstance?.isActive("bold")
    },
    {
      icon: Italic,
      label: "italic",
      event: () => props.editorInstance?.chain().focus().toggleItalic().run(),
      isActive: () => props.editorInstance?.isActive("italic")
    },
    {
      icon: Underline,
      label: "underline",
      event: () => props.editorInstance?.chain().focus().toggleUnderline().run(),
      isActive: () => props.editorInstance?.isActive("underline")
    },
    {
      icon: Strikethrough,
      label: "strikethrough",
      event: () => props.editorInstance?.chain().focus().toggleStrike().run(),
      isActive: () => props.editorInstance?.isActive("strike")
    }
  ],
  [
    {
      icon: LayoutList,
      label: "bulletList",
      event: () => props.editorInstance?.chain().focus().toggleBulletList().run(),
      isActive: () => props.editorInstance?.isActive("bulletList")
    },
    {
      icon: ListOrdered,
      label: "orderedList",
      event: () => props.editorInstance?.chain().focus().toggleOrderedList().run(),
      isActive: () => props.editorInstance?.isActive("orderedList")
    }
  ],
  [
    //   { icon: Link, label: "link" },
    //   { icon: Image, label: "image" },
    //   { icon: Quote, label: "blockquote" },
    //   { icon: Table, label: "table" },
    //   { icon: Film, label: "codeBlock" },
    {
      icon: Minus,
      label: "horizontalRule",
      event: () => props.editorInstance?.chain().focus().setHorizontalRule().run(),
      isActive: () => false
    }
  ]
];
</script>
