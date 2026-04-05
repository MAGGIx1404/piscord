<template>
  <div class="flex items-center gap-0.5 border-b border-border/50 bg-card/30 px-3 py-1.5">
    <!-- Text formatting -->
    <TooltipProvider :delay-duration="300">
      <Tooltip v-for="item in formattingButtons" :key="item.action">
        <TooltipTrigger as-child>
          <WorkspaceToolbarButton
            :active="item.isActive?.()"
            :title="item.title"
            @click="item.command"
          >
            <component :is="item.icon" class="size-3.5" />
          </WorkspaceToolbarButton>
        </TooltipTrigger>
        <TooltipContent side="bottom" :side-offset="4" class="text-xs">
          {{ item.title }}
          <span v-if="item.shortcut" class="ml-1 text-muted-foreground/60">{{
            item.shortcut
          }}</span>
        </TooltipContent>
      </Tooltip>

      <div class="mx-1 h-4 w-px bg-border/30" />

      <!-- Heading levels -->
      <Tooltip v-for="level in [1, 2, 3] as const" :key="level">
        <TooltipTrigger as-child>
          <WorkspaceToolbarButton
            :active="editor?.isActive('heading', { level })"
            :title="`Heading ${level}`"
            @click="editor?.chain().focus().toggleHeading({ level }).run()"
          >
            <span class="text-[10px] leading-none font-bold">H{{ level }}</span>
          </WorkspaceToolbarButton>
        </TooltipTrigger>
        <TooltipContent side="bottom" :side-offset="4" class="text-xs">
          Heading {{ level }}
        </TooltipContent>
      </Tooltip>

      <div class="mx-1 h-4 w-px bg-border/30" />

      <!-- Lists -->
      <Tooltip>
        <TooltipTrigger as-child>
          <WorkspaceToolbarButton
            :active="editor?.isActive('bulletList')"
            title="Bullet List"
            @click="editor?.chain().focus().toggleBulletList().run()"
          >
            <List class="size-3.5" />
          </WorkspaceToolbarButton>
        </TooltipTrigger>
        <TooltipContent side="bottom" :side-offset="4" class="text-xs">Bullet List</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <WorkspaceToolbarButton
            :active="editor?.isActive('orderedList')"
            title="Ordered List"
            @click="editor?.chain().focus().toggleOrderedList().run()"
          >
            <ListOrdered class="size-3.5" />
          </WorkspaceToolbarButton>
        </TooltipTrigger>
        <TooltipContent side="bottom" :side-offset="4" class="text-xs">Ordered List</TooltipContent>
      </Tooltip>

      <div class="mx-1 h-4 w-px bg-border/30" />

      <!-- Block elements -->
      <Tooltip>
        <TooltipTrigger as-child>
          <WorkspaceToolbarButton
            :active="editor?.isActive('blockquote')"
            title="Blockquote"
            @click="editor?.chain().focus().toggleBlockquote().run()"
          >
            <Quote class="size-3.5" />
          </WorkspaceToolbarButton>
        </TooltipTrigger>
        <TooltipContent side="bottom" :side-offset="4" class="text-xs">Blockquote</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <WorkspaceToolbarButton
            :active="editor?.isActive('codeBlock')"
            title="Code Block"
            @click="editor?.chain().focus().toggleCodeBlock().run()"
          >
            <Code class="size-3.5" />
          </WorkspaceToolbarButton>
        </TooltipTrigger>
        <TooltipContent side="bottom" :side-offset="4" class="text-xs">Code Block</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <WorkspaceToolbarButton
            title="Horizontal Rule"
            @click="editor?.chain().focus().setHorizontalRule().run()"
          >
            <Minus class="size-3.5" />
          </WorkspaceToolbarButton>
        </TooltipTrigger>
        <TooltipContent side="bottom" :side-offset="4" class="text-xs">Divider</TooltipContent>
      </Tooltip>

      <div class="mx-1 h-4 w-px bg-border/30" />

      <!-- Text alignment -->
      <Tooltip v-for="align in alignments" :key="align.value">
        <TooltipTrigger as-child>
          <WorkspaceToolbarButton
            :active="editor?.isActive({ textAlign: align.value })"
            :title="align.title"
            @click="editor?.chain().focus().setTextAlign(align.value).run()"
          >
            <component :is="align.icon" class="size-3.5" />
          </WorkspaceToolbarButton>
        </TooltipTrigger>
        <TooltipContent side="bottom" :side-offset="4" class="text-xs">
          {{ align.title }}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    <!-- Spacer -->
    <div class="flex-1" />

    <!-- Undo / Redo -->
    <TooltipProvider :delay-duration="300">
      <Tooltip>
        <TooltipTrigger as-child>
          <WorkspaceToolbarButton
            title="Undo"
            :class="{ 'opacity-30': !editor?.can().undo() }"
            @click="editor?.chain().focus().undo().run()"
          >
            <Undo class="size-3.5" />
          </WorkspaceToolbarButton>
        </TooltipTrigger>
        <TooltipContent side="bottom" :side-offset="4" class="text-xs">
          Undo <span class="text-muted-foreground/60">⌘Z</span>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger as-child>
          <WorkspaceToolbarButton
            title="Redo"
            :class="{ 'opacity-30': !editor?.can().redo() }"
            @click="editor?.chain().focus().redo().run()"
          >
            <Redo class="size-3.5" />
          </WorkspaceToolbarButton>
        </TooltipTrigger>
        <TooltipContent side="bottom" :side-offset="4" class="text-xs">
          Redo <span class="text-muted-foreground/60">⌘⇧Z</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</template>

<script setup lang="ts">
import { WorkspaceToolbarButton } from "#components";
import type { Editor } from "@tiptap/vue-3";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  Code,
  List,
  ListOrdered,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo
} from "lucide-vue-next";

const props = defineProps<{
  editor: Editor | undefined;
}>();

const formattingButtons = computed(() => [
  {
    action: "bold",
    icon: Bold,
    title: "Bold",
    shortcut: "⌘B",
    isActive: () => props.editor?.isActive("bold"),
    command: () => props.editor?.chain().focus().toggleBold().run()
  },
  {
    action: "italic",
    icon: Italic,
    title: "Italic",
    shortcut: "⌘I",
    isActive: () => props.editor?.isActive("italic"),
    command: () => props.editor?.chain().focus().toggleItalic().run()
  },
  {
    action: "underline",
    icon: UnderlineIcon,
    title: "Underline",
    shortcut: "⌘U",
    isActive: () => props.editor?.isActive("underline"),
    command: () => props.editor?.chain().focus().toggleUnderline().run()
  },
  {
    action: "strike",
    icon: Strikethrough,
    title: "Strikethrough",
    isActive: () => props.editor?.isActive("strike"),
    command: () => props.editor?.chain().focus().toggleStrike().run()
  },
  {
    action: "highlight",
    icon: Highlighter,
    title: "Highlight",
    isActive: () => props.editor?.isActive("highlight"),
    command: () => props.editor?.chain().focus().toggleHighlight().run()
  }
]);

const alignments = [
  { value: "left" as const, icon: AlignLeft, title: "Align Left" },
  { value: "center" as const, icon: AlignCenter, title: "Align Center" },
  { value: "right" as const, icon: AlignRight, title: "Align Right" }
];
</script>
