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
      <Separator orientation="vertical" class="min-h-9" />
    </div>

    <!-- Layout btns -->
    <div class="flex items-center gap-2">
      <!-- Link Button (only visible when text is selected) -->
      <TooltipProvider v-if="hasSelection && !isLinkActive">
        <Tooltip>
          <Dialog>
            <DialogTrigger as-child>
              <TooltipTrigger as-child>
                <Button size="icon" variant="ghost">
                  <Link class="size-4" />
                </Button>
              </TooltipTrigger>
            </DialogTrigger>

            <DialogContent class="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle> Add Link </DialogTitle>
                <DialogDescription> Enter the URL you want to link to. </DialogDescription>
              </DialogHeader>
              <ButtonGroup class="gap-0! w-full">
                <ButtonGroupText as-child>
                  <Label for="url">https://</Label>
                </ButtonGroupText>
                <InputGroup>
                  <InputGroupInput id="url" placeholder="example.com" v-model="linkUrl" />
                  <InputGroupAddon align="inline-end">
                    <Link2Icon />
                  </InputGroupAddon>
                </InputGroup>
              </ButtonGroup>
              <DialogFooter>
                <DialogClose as-child>
                  <Button variant="outline"> Cancel </Button>
                </DialogClose>
                <DialogClose as-child>
                  <Button
                    type="submit"
                    @click.prevent="handleLinkAdd(linkUrl)"
                    :disabled="!linkUrl.trim()"
                  >
                    Add Link
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <TooltipContent>
            <p>Link</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <!-- Remove Link Button (only visible when cursor is on a link) -->
      <TooltipProvider v-if="isLinkActive">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              size="icon"
              variant="ghost"
              class="text-destructive hover:text-destructive hover:bg-destructive/10"
              @click="handleRemoveLink"
            >
              <Unlink class="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Remove Link</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <!-- Horizontal Rule Button -->
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              size="icon"
              variant="ghost"
              @click.prevent="editorInstance?.chain().focus().setHorizontalRule().run()"
            >
              <Minus class="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>HorizontalRule</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <!-- Table Button -->
      <TooltipProvider>
        <Tooltip>
          <Dialog>
            <DialogTrigger as-child>
              <TooltipTrigger as-child>
                <Button size="icon" variant="ghost">
                  <Table class="size-4" />
                </Button>
              </TooltipTrigger>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle> Insert Table </DialogTitle>
                <DialogDescription>
                  Specify the number of rows and columns for the table.
                </DialogDescription>
              </DialogHeader>
              <div class="grid grid-cols-2 gap-4 mt-4">
                <div class="flex flex-col gap-1">
                  <Label for="rows">Rows</Label>
                  <Input id="rows" type="number" min="1" max="20" v-model.number="tableRows" />
                </div>
                <div class="flex flex-col gap-1">
                  <Label for="columns">Columns</Label>
                  <Input
                    id="columns"
                    type="number"
                    min="1"
                    max="10"
                    v-model.number="tableColumns"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose as-child>
                  <Button variant="outline"> Cancel </Button>
                </DialogClose>
                <DialogClose as-child>
                  <Button type="submit" @click.prevent="handleInsertTable(tableRows, tableColumns)">
                    Insert Table
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <TooltipContent>
            <p>Table</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <!-- Image Button -->
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              size="icon"
              variant="ghost"
              @click.prevent="
                editorInstance
                  ?.chain()
                  .focus()
                  .setImage({ src: 'https://placekitten.com/800/400' })
                  .run()
              "
            >
              <Image class="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Insert Image</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
  Minus,
  Link2Icon,
  Unlink
} from "lucide-vue-next";

const props = defineProps<{
  editorInstance: any;
}>();

type ToolbarButton = {
  icon: any;
  label: string;
  class?: string;
  event: () => void;
  disabled?: () => boolean;
  action?: string;
  isActive?: () => boolean;
};

const toolbarButtons: ToolbarButton[][] = [
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
  ]
];

const linkUrl = ref("");

const hasSelection = computed(() => {
  if (!props.editorInstance) return false;
  const { from, to } = props.editorInstance.state.selection;
  return from !== to;
});

const isLinkActive = computed(() => {
  return props.editorInstance?.isActive("link") ?? false;
});

const handleRemoveLink = () => {
  props.editorInstance?.chain().focus().unsetLink().run();
};

const handleLinkAdd = (url: string) => {
  props.editorInstance?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  linkUrl.value = "";
};

const tableRows = ref(2);
const tableColumns = ref(2);

const handleInsertTable = (rows: number, cols: number) => {
  props.editorInstance?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
  tableRows.value = 2;
  tableColumns.value = 2;
};
</script>
