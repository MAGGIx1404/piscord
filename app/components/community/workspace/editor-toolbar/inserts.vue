<template>
  <div class="flex items-center gap-2">
    <!-- Horizontal Rule Button -->
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            size="icon"
            variant="ghost"
            @click.prevent="editor?.chain().focus().setHorizontalRule().run()"
          >
            <Minus class="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Horizontal Rule</p>
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
              <DialogClose as-child>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose as-child>
                <Button type="submit" @click.prevent="handleInsertTable"> Insert Table </Button>
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
        <Dialog>
          <DialogTrigger as-child>
            <TooltipTrigger as-child>
              <Button size="icon" variant="ghost">
                <Image class="size-4" />
              </Button>
            </TooltipTrigger>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Image</DialogTitle>
              <DialogDescription>Add an image by selecting a file.</DialogDescription>
            </DialogHeader>

            <!-- File Input -->
            <div
              class="w-full h-40 border-2 border-dotted rounded-md relative overflow-hidden my-2"
            >
              <Input
                type="file"
                accept="image/*"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                @change.prevent="handleOnFileChange($event)"
              />

              <div
                v-if="!imageUrl"
                class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none gap-2"
              >
                <ImagePlus class="size-6 text-muted-foreground" />
                <p class="text-xs text-muted-foreground">
                  Drag and drop an image here, or click to select a file
                </p>
              </div>

              <!-- Display image preview -->
              <div v-if="imageUrl" class="absolute inset-0 pointer-events-none">
                <img
                  :src="imageUrl"
                  alt="Image Preview"
                  class="w-full h-full object-contain rounded-md"
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose as-child>
                <Button variant="outline" @click="imageUrl = null">Cancel</Button>
              </DialogClose>
              <DialogClose as-child>
                <Button type="submit" @click.prevent="handleInsertImage" :disabled="!imageUrl">
                  Add Image
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <TooltipContent>
          <p>Insert Image</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</template>

<script setup lang="ts">
import { Minus, Table, Image, ImagePlus } from "lucide-vue-next";

const props = defineProps<{
  editor: any;
}>();

// Table state
const tableRows = ref(2);
const tableColumns = ref(2);

const handleInsertTable = () => {
  props.editor
    ?.chain()
    .focus()
    .insertTable({ rows: tableRows.value, cols: tableColumns.value, withHeaderRow: true })
    .run();
  tableRows.value = 2;
  tableColumns.value = 2;
};

// Image state
const imageUrl = ref<string | null>(null);

const handleOnFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files ? target.files[0] : null;
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleInsertImage = () => {
  if (imageUrl.value) {
    props.editor?.chain().focus().setImage({ src: imageUrl.value }).run();
    imageUrl.value = null;
  }
};
</script>
