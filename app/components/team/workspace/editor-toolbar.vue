<template>
  <div class="w-full flex items-center gap-2 p-2 border-b flex-wrap">
    <div
      v-for="(group, groupIndex) in toolbarButtons"
      :key="`group-${groupIndex}`"
      class="flex items-center gap-2"
    >
      <Button v-for="(btn, btnIndex) in group" :key="`btn-${btnIndex}`" size="icon" variant="ghost">
        <component :is="btn.icon" :class="btn.class || 'size-4'" />
      </Button>

      <Separator
        v-if="groupIndex < toolbarButtons.length - 1"
        orientation="vertical"
        class="min-h-9"
      />
    </div>
  </div>
</template>
<script setup>
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

const toolbarButtons = [
  [
    { icon: RotateCcw, action: "undo" },
    { icon: RotateCw, action: "redo" }
  ],
  [
    { icon: Heading1, action: "heading1", class: "size-5" },
    { icon: Heading2, action: "heading2", class: "size-5" },
    { icon: Heading3, action: "heading3", class: "size-5" },
    { icon: Heading4, action: "heading4", class: "size-5" },
    { icon: Heading5, action: "heading5", class: "size-5" },
    { icon: Heading6, action: "heading6", class: "size-5" }
  ],
  [
    { icon: Bold, action: "bold" },
    { icon: Italic, action: "italic" },
    { icon: Underline, action: "underline" },
    { icon: Strikethrough, action: "strikethrough" }
  ],
  [
    { icon: LayoutList, action: "bulletList" },
    { icon: ListOrdered, action: "orderedList" }
  ],
  [
    { icon: Link, action: "link" },
    { icon: Image, action: "image" },
    { icon: Quote, action: "blockquote" },
    { icon: Table, action: "table" },
    { icon: Film, action: "codeBlock" },
    { icon: Minus, action: "horizontalRule" }
  ]
];
</script>
