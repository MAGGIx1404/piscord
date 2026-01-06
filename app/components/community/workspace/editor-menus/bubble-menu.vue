<template>
  <div
    v-if="showMenu"
    ref="menuRef"
    class="fixed z-50 flex items-center gap-1 p-1.5 rounded-lg border border-input bg-popover shadow-xl animate-in fade-in-0 zoom-in-95"
    :style="{ top: `${position.y}px`, left: `${position.x}px` }"
  >
    <!-- Text Style Dropdown -->
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" class="h-8 gap-1 px-2">
          <component :is="currentBlockIcon" class="size-4" />
          <span class="text-xs">{{ currentBlockLabel }}</span>
          <ChevronDown class="size-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" class="w-48">
        <DropdownMenuItem
          v-for="block in blockTypes"
          :key="block.value"
          @click="block.action"
          :class="{ 'bg-accent': block.isActive() }"
        >
          <component :is="block.icon" class="size-4 mr-2" />
          {{ block.label }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <Separator orientation="vertical" class="h-6" />

    <!-- Formatting Buttons -->
    <div class="flex items-center gap-0.5">
      <Tooltip v-for="btn in formattingButtons" :key="btn.label">
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            class="size-8"
            @click="btn.action"
            :class="{ 'bg-accent text-accent-foreground': btn.isActive() }"
          >
            <component :is="btn.icon" class="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" :sideOffset="8">
          <p class="text-xs">{{ btn.label }}</p>
        </TooltipContent>
      </Tooltip>
    </div>

    <Separator orientation="vertical" class="h-6" />

    <!-- Link Button -->
    <Popover v-model:open="linkPopoverOpen">
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          class="size-8"
          :class="{ 'bg-accent text-accent-foreground': editor?.isActive('link') }"
        >
          <Link2 class="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-80" align="start">
        <div class="space-y-3">
          <div class="space-y-2">
            <Label>Link URL</Label>
            <Input v-model="linkUrl" placeholder="https://example.com" @keydown.enter="setLink" />
          </div>
          <div class="w-full flex items-center justify-end gap-2">
            <Button v-if="editor?.isActive('link')" variant="destructive" @click="removeLink">
              Remove
            </Button>
            <Button @click="setLink"> Apply </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>

    <Separator orientation="vertical" class="h-6" />

    <!-- Text Color Picker -->
    <Popover v-model:open="colorPopoverOpen">
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          class="size-8 relative"
          :class="{ 'bg-accent text-accent-foreground': currentTextColor }"
        >
          <Palette class="size-4" />
          <span
            v-if="currentTextColor"
            class="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full"
            :style="{ backgroundColor: currentTextColor }"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-48 p-2" align="start">
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground px-1">Text Color</p>
          <div class="grid grid-cols-5 gap-1">
            <Tooltip v-for="color in colorPresets" :key="color.name">
              <TooltipTrigger asChild>
                <button
                  @click="setTextColor(color.value)"
                  class="size-7 rounded-md border border-input flex items-center justify-center hover:scale-110 transition-transform"
                  :class="{
                    'ring-2 ring-primary ring-offset-1':
                      currentTextColor === color.value || (!currentTextColor && !color.value)
                  }"
                  :style="color.value ? { backgroundColor: color.value } : {}"
                >
                  <RotateCcw v-if="!color.value" class="size-3.5 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" :sideOffset="4">
                <p class="text-xs">{{ color.name }}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronDown,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link2,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  Quote,
  Palette,
  RotateCcw
} from "lucide-vue-next";

// Color presets for the color picker
const colorPresets = [
  { name: "Default", value: "" },
  { name: "Gray", value: "#6b7280" },
  { name: "Brown", value: "#92400e" },
  { name: "Orange", value: "#ea580c" },
  { name: "Yellow", value: "#ca8a04" },
  { name: "Green", value: "#16a34a" },
  { name: "Blue", value: "#2563eb" },
  { name: "Purple", value: "#9333ea" },
  { name: "Pink", value: "#db2777" },
  { name: "Red", value: "#dc2626" }
];

const props = defineProps<{
  editor: any;
}>();

const showMenu = ref(false);
const position = ref({ x: 0, y: 0 });
const menuRef = ref<HTMLElement | null>(null);
const linkPopoverOpen = ref(false);
const linkUrl = ref("");
const colorPopoverOpen = ref(false);

// Get current text color from selection
const currentTextColor = computed(() => {
  return props.editor?.getAttributes("textStyle")?.color || "";
});

// Set text color
const setTextColor = (color: string) => {
  if (color) {
    props.editor?.chain().focus().setColor(color).run();
  } else {
    props.editor?.chain().focus().unsetColor().run();
  }
  colorPopoverOpen.value = false;
};

// Watch for editor selection changes
watch(
  () => props.editor?.state.selection,
  () => {
    updateMenuPosition();
  },
  { deep: true }
);

const updateMenuPosition = () => {
  if (!props.editor) return;

  const { from, to, empty } = props.editor.state.selection;

  // Hide menu if no selection or cursor is collapsed
  if (empty || from === to) {
    showMenu.value = false;
    return;
  }

  // Hide menu for node selections (images, tables, etc.)
  const isNodeSelection = props.editor.state.selection.node;
  if (isNodeSelection) {
    showMenu.value = false;
    return;
  }

  // Hide menu if selection contains non-text nodes like images
  const { doc } = props.editor.state;
  let hasNonTextNode = false;
  doc.nodesBetween(from, to, (node: any) => {
    if (node.type.name === "image" || node.type.name === "youtube" || node.type.name === "table") {
      hasNonTextNode = true;
      return false;
    }
  });
  if (hasNonTextNode) {
    showMenu.value = false;
    return;
  }

  // Get coordinates of the selection
  const view = props.editor.view;
  const start = view.coordsAtPos(from);
  const end = view.coordsAtPos(to);

  // Calculate center position above selection
  const centerX = (start.left + end.left) / 2;
  const topY = Math.min(start.top, end.top);

  // Adjust for menu width (approximate)
  const menuWidth = 400;
  const x = Math.max(10, centerX - menuWidth / 2);
  const y = topY - 50; // 50px above selection

  position.value = { x, y: Math.max(10, y) };
  showMenu.value = true;
};

// Also listen to selection events on mount
onMounted(() => {
  if (props.editor) {
    props.editor.on("selectionUpdate", updateMenuPosition);
    props.editor.on("blur", () => {
      // Delay hiding to allow clicks on menu
      setTimeout(() => {
        if (!menuRef.value?.contains(document.activeElement)) {
          showMenu.value = false;
        }
      }, 150);
    });
  }
});

onUnmounted(() => {
  if (props.editor) {
    props.editor.off("selectionUpdate", updateMenuPosition);
  }
});

const blockTypes = computed(() => [
  {
    value: "paragraph",
    label: "Text",
    icon: Type,
    action: () => props.editor?.chain().focus().setParagraph().run(),
    isActive: () => props.editor?.isActive("paragraph")
  },
  {
    value: "heading1",
    label: "Heading 1",
    icon: Heading1,
    action: () => props.editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: () => props.editor?.isActive("heading", { level: 1 })
  },
  {
    value: "heading2",
    label: "Heading 2",
    icon: Heading2,
    action: () => props.editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: () => props.editor?.isActive("heading", { level: 2 })
  },
  {
    value: "heading3",
    label: "Heading 3",
    icon: Heading3,
    action: () => props.editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: () => props.editor?.isActive("heading", { level: 3 })
  },
  {
    value: "heading4",
    label: "Heading 4",
    icon: Heading4,
    action: () => props.editor?.chain().focus().toggleHeading({ level: 4 }).run(),
    isActive: () => props.editor?.isActive("heading", { level: 4 })
  },
  {
    value: "heading5",
    label: "Heading 5",
    icon: Heading5,
    action: () => props.editor?.chain().focus().toggleHeading({ level: 5 }).run(),
    isActive: () => props.editor?.isActive("heading", { level: 5 })
  },
  {
    value: "heading6",
    label: "Heading 6",
    icon: Heading6,
    action: () => props.editor?.chain().focus().toggleHeading({ level: 6 }).run(),
    isActive: () => props.editor?.isActive("heading", { level: 6 })
  },
  {
    value: "bulletList",
    label: "Bullet List",
    icon: List,
    action: () => props.editor?.chain().focus().toggleBulletList().run(),
    isActive: () => props.editor?.isActive("bulletList")
  },
  {
    value: "orderedList",
    label: "Numbered List",
    icon: ListOrdered,
    action: () => props.editor?.chain().focus().toggleOrderedList().run(),
    isActive: () => props.editor?.isActive("orderedList")
  },
  {
    value: "blockquote",
    label: "Quote",
    icon: Quote,
    action: () => props.editor?.chain().focus().toggleBlockquote().run(),
    isActive: () => props.editor?.isActive("blockquote")
  }
]);

const currentBlockIcon = computed(() => {
  const active = blockTypes.value.find((b) => b.isActive());
  return active?.icon || Type;
});

const currentBlockLabel = computed(() => {
  const active = blockTypes.value.find((b) => b.isActive());
  return active?.label || "Text";
});

const formattingButtons = computed(() => [
  {
    icon: Bold,
    label: "Bold",
    action: () => props.editor?.chain().focus().toggleBold().run(),
    isActive: () => props.editor?.isActive("bold")
  },
  {
    icon: Italic,
    label: "Italic",
    action: () => props.editor?.chain().focus().toggleItalic().run(),
    isActive: () => props.editor?.isActive("italic")
  },
  {
    icon: Underline,
    label: "Underline",
    action: () => props.editor?.chain().focus().toggleUnderline().run(),
    isActive: () => props.editor?.isActive("underline")
  },
  {
    icon: Strikethrough,
    label: "Strikethrough",
    action: () => props.editor?.chain().focus().toggleStrike().run(),
    isActive: () => props.editor?.isActive("strike")
  },
  {
    icon: Code,
    label: "Code",
    action: () => props.editor?.chain().focus().toggleCode().run(),
    isActive: () => props.editor?.isActive("code")
  }
]);

const setLink = () => {
  if (linkUrl.value) {
    props.editor?.chain().focus().extendMarkRange("link").setLink({ href: linkUrl.value }).run();
  }
  linkPopoverOpen.value = false;
  linkUrl.value = "";
};

const removeLink = () => {
  props.editor?.chain().focus().unsetLink().run();
  linkPopoverOpen.value = false;
  linkUrl.value = "";
};

watch(linkPopoverOpen, (open) => {
  if (open) {
    const existingLink = props.editor?.getAttributes("link").href;
    linkUrl.value = existingLink || "";
  }
});
</script>
