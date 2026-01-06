<template>
  <div
    v-if="showMenu"
    ref="menuRef"
    class="fixed z-50 min-w-80 max-h-80 overflow-y-auto rounded-lg border border-input bg-popover p-2 shadow-xl"
    :style="{ top: `${position.y}px`, left: `${position.x}px` }"
  >
    <!-- Search Input -->
    <div class="pb-2">
      <Input
        ref="searchInputRef"
        v-model="searchQuery"
        placeholder="Search blocks..."
        @keydown.down.prevent="navigateDown"
        @keydown.up.prevent="navigateUp"
        @keydown.enter.prevent="selectItem"
        @keydown.escape="closeMenu"
      />
    </div>

    <!-- Menu Items -->
    <div class="space-y-1">
      <template v-for="(group, groupIndex) in filteredGroups" :key="group.title">
        <div v-if="group.items.length > 0">
          <p class="px-2 py-1 text-xs font-medium text-muted-foreground">{{ group.title }}</p>
          <button
            v-for="(item, itemIndex) in group.items"
            :key="item.title"
            class="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors"
            :class="{ 'bg-accent': isSelected(groupIndex, itemIndex) }"
            @click="executeCommand(item)"
            @mouseenter="setSelected(groupIndex, itemIndex)"
          >
            <div
              class="flex size-10 items-center justify-center rounded-md border border-input bg-background"
            >
              <component :is="item.icon" class="size-5 text-muted-foreground" />
            </div>
            <div class="flex-1 text-left">
              <p class="font-medium">{{ item.title }}</p>
              <p class="text-xs text-muted-foreground">{{ item.description }}</p>
            </div>
          </button>
        </div>
      </template>

      <!-- No results -->
      <div v-if="filteredGroups.every((g) => g.items.length === 0)" class="px-2 py-4 text-center">
        <p class="text-sm text-muted-foreground">No results found</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
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
  Minus,
  Table,
  Image,
  Youtube,
  FileCode
} from "lucide-vue-next";

const props = defineProps<{
  editor: any;
}>();

const emit = defineEmits<{
  (e: "insertTable"): void;
  (e: "insertImage"): void;
  (e: "insertYoutube"): void;
}>();

const showMenu = ref(false);
const searchQuery = ref("");
const position = ref({ x: 0, y: 0 });
const selectedGroup = ref(0);
const selectedItem = ref(0);
const menuRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<InstanceType<
  typeof import("~/components/ui/input/Input.vue").default
> | null>(null);

const menuGroups = [
  {
    title: "Basic Blocks",
    items: [
      {
        title: "Text",
        description: "Start writing with plain text",
        icon: Type,
        command: () => props.editor?.chain().focus().setParagraph().run()
      },
      {
        title: "Heading 1",
        description: "Large section heading",
        icon: Heading1,
        command: () => props.editor?.chain().focus().toggleHeading({ level: 1 }).run()
      },
      {
        title: "Heading 2",
        description: "Medium section heading",
        icon: Heading2,
        command: () => props.editor?.chain().focus().toggleHeading({ level: 2 }).run()
      },
      {
        title: "Heading 3",
        description: "Small section heading",
        icon: Heading3,
        command: () => props.editor?.chain().focus().toggleHeading({ level: 3 }).run()
      },
      {
        title: "Heading 4",
        description: "Level 4 heading",
        icon: Heading4,
        command: () => props.editor?.chain().focus().toggleHeading({ level: 4 }).run()
      },
      {
        title: "Heading 5",
        description: "Level 5 heading",
        icon: Heading5,
        command: () => props.editor?.chain().focus().toggleHeading({ level: 5 }).run()
      },
      {
        title: "Heading 6",
        description: "Level 6 heading",
        icon: Heading6,
        command: () => props.editor?.chain().focus().toggleHeading({ level: 6 }).run()
      }
    ]
  },
  {
    title: "Lists",
    items: [
      {
        title: "Bullet List",
        description: "Create a simple bullet list",
        icon: List,
        command: () => props.editor?.chain().focus().toggleBulletList().run()
      },
      {
        title: "Numbered List",
        description: "Create a numbered list",
        icon: ListOrdered,
        command: () => props.editor?.chain().focus().toggleOrderedList().run()
      }
    ]
  },
  {
    title: "Advanced",
    items: [
      {
        title: "Quote",
        description: "Add a blockquote",
        icon: Quote,
        command: () => props.editor?.chain().focus().toggleBlockquote().run()
      },
      {
        title: "Code Block",
        description: "Add a code snippet",
        icon: FileCode,
        command: () => props.editor?.chain().focus().toggleCodeBlock().run()
      },
      {
        title: "Divider",
        description: "Add a horizontal divider",
        icon: Minus,
        command: () => props.editor?.chain().focus().setHorizontalRule().run()
      }
    ]
  },
  {
    title: "Media & Embeds",
    items: [
      {
        title: "Table",
        description: "Add a table",
        icon: Table,
        command: () => emit("insertTable")
      },
      {
        title: "Image",
        description: "Upload or embed an image",
        icon: Image,
        command: () => emit("insertImage")
      },
      {
        title: "YouTube",
        description: "Embed a YouTube video",
        icon: Youtube,
        command: () => emit("insertYoutube")
      }
    ]
  }
];

const filteredGroups = computed(() => {
  if (!searchQuery.value) return menuGroups;

  return menuGroups.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }));
});

const isSelected = (groupIndex: number, itemIndex: number) => {
  return selectedGroup.value === groupIndex && selectedItem.value === itemIndex;
};

const setSelected = (groupIndex: number, itemIndex: number) => {
  selectedGroup.value = groupIndex;
  selectedItem.value = itemIndex;
};

const navigateDown = () => {
  const currentGroup = filteredGroups.value[selectedGroup.value];
  if (!currentGroup) return;
  if (selectedItem.value < currentGroup.items.length - 1) {
    selectedItem.value++;
  } else if (selectedGroup.value < filteredGroups.value.length - 1) {
    selectedGroup.value++;
    selectedItem.value = 0;
  }
};

const navigateUp = () => {
  if (selectedItem.value > 0) {
    selectedItem.value--;
  } else if (selectedGroup.value > 0) {
    selectedGroup.value--;
    const prevGroup = filteredGroups.value[selectedGroup.value];
    selectedItem.value = prevGroup ? prevGroup.items.length - 1 : 0;
  }
};

const selectItem = () => {
  const group = filteredGroups.value[selectedGroup.value];
  const item = group?.items[selectedItem.value];
  if (item) {
    executeCommand(item);
  }
};

const executeCommand = (item: (typeof menuGroups)[0]["items"][0]) => {
  item.command();
  closeMenu();
};

const openMenu = (coords: { x: number; y: number }) => {
  position.value = coords;
  showMenu.value = true;
  searchQuery.value = "";
  selectedGroup.value = 0;
  selectedItem.value = 0;

  nextTick(() => {
    const inputEl = searchInputRef.value?.$el as HTMLInputElement;
    inputEl?.focus();
  });
};

const closeMenu = () => {
  showMenu.value = false;
  props.editor?.chain().focus().run();
};

// Click outside to close
const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    closeMenu();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// Reset selection when search changes
watch(searchQuery, () => {
  selectedGroup.value = 0;
  selectedItem.value = 0;
});

defineExpose({
  openMenu,
  closeMenu,
  showMenu
});
</script>
