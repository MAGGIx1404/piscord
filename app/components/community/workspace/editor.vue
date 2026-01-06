<template>
  <div class="w-full rounded-md px-4 pb-10" id="tiptap">
    <!-- Bubble Menu (appears on text selection) -->
    <CommunityWorkspaceEditorMenusBubbleMenu v-if="editorInstance" :editor="editorInstance" />

    <!-- Slash Menu (appears on / command or right-click) -->
    <CommunityWorkspaceEditorMenusSlashMenu
      ref="slashMenuRef"
      :editor="editorInstance"
      @insert-table="openTableDialog"
      @insert-image="openImageDialog"
      @insert-youtube="openYoutubeDialog"
    />

    <!-- Editor -->
    <Card class="w-full h-full border-x border-b rounded-b-md p-0">
      <div class="w-full" @contextmenu.prevent="handleContextMenu">
        <EditorContent :editor="editorInstance" />
      </div>
    </Card>

    <!-- Table Dialog -->
    <Dialog v-model:open="tableDialogOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Insert Table</DialogTitle>
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
            <Input id="columns" type="number" min="1" max="10" v-model.number="tableColumns" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button @click="insertTable">Insert Table</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Image Dialog -->
    <Dialog v-model:open="imageDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
          <DialogDescription>Add an image by URL or upload a file.</DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label>Image URL</Label>
            <Input v-model="imageUrl" placeholder="https://example.com/image.jpg" />
          </div>
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <span class="w-full border-t" />
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-background px-2 text-muted-foreground">Or upload</span>
            </div>
          </div>
          <div
            class="w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
            @click="triggerImageUpload"
          >
            <input
              ref="imageInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleImageUpload"
            />
            <div class="text-center">
              <ImagePlus class="size-8 mx-auto text-muted-foreground" />
              <p class="text-sm text-muted-foreground mt-2">Click to upload</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button @click="insertImage" :disabled="!imageUrl">Insert Image</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- YouTube Dialog -->
    <Dialog v-model:open="youtubeDialogOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Embed YouTube Video</DialogTitle>
          <DialogDescription> Paste the YouTube video URL to embed it. </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label>YouTube URL</Label>
            <Input v-model="youtubeUrl" placeholder="https://www.youtube.com/watch?v=..." />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button @click="insertYoutube" :disabled="!youtubeUrl">Embed Video</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { ImagePlus } from "lucide-vue-next";
import CodeBlock from "./code-block.vue";

const model = defineModel<String>({
  required: true,
  default: ""
});

const slashMenuRef = ref();
const imageInputRef = ref<HTMLInputElement | null>(null);

// Dialog states
const tableDialogOpen = ref(false);
const imageDialogOpen = ref(false);
const youtubeDialogOpen = ref(false);

// Form values
const tableRows = ref(3);
const tableColumns = ref(3);
const imageUrl = ref("");
const youtubeUrl = ref("");

const editorInstance = useEditor({
  content: model.value,
  editorProps: {
    attributes: {
      class: "tiptap-prose"
    },
    handleKeyDown: (view, event) => {
      // Handle slash command
      if (event.key === "/" && !event.ctrlKey && !event.metaKey) {
        const { from } = view.state.selection;
        const coords = view.coordsAtPos(from);
        nextTick(() => {
          slashMenuRef.value?.openMenu({
            x: coords.left,
            y: coords.bottom + 8
          });
        });
      }
      return false;
    }
  },
  onUpdate: ({ editor }) => {
    model.value = editor.getHTML();
  },
  extensions: tiptapExtensions(undefined, CodeBlock)
});

// Context menu handler
const handleContextMenu = (event: MouseEvent) => {
  slashMenuRef.value?.openMenu({
    x: event.clientX,
    y: event.clientY
  });
};

// Dialog openers
const openTableDialog = () => {
  tableDialogOpen.value = true;
};

const openImageDialog = () => {
  imageDialogOpen.value = true;
  imageUrl.value = "";
};

const openYoutubeDialog = () => {
  youtubeDialogOpen.value = true;
  youtubeUrl.value = "";
};

// Insert functions
const insertTable = () => {
  editorInstance.value
    ?.chain()
    .focus()
    .insertTable({ rows: tableRows.value, cols: tableColumns.value, withHeaderRow: true })
    .run();
};

const insertImage = () => {
  if (imageUrl.value) {
    editorInstance.value?.chain().focus().setImage({ src: imageUrl.value }).run();
  }
};

const insertYoutube = () => {
  if (youtubeUrl.value) {
    editorInstance.value?.chain().focus().setYoutubeVideo({ src: youtubeUrl.value }).run();
  }
};

const triggerImageUpload = () => {
  imageInputRef.value?.click();
};

const handleImageUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};
</script>
