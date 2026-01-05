<template>
  <div class="flex items-center gap-2">
    <!-- Add Link Button (only visible when text is selected and not already a link) -->
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
              <DialogTitle>Add Link</DialogTitle>
              <DialogDescription>Enter the URL you want to link to.</DialogDescription>
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
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose as-child>
                <Button type="submit" @click.prevent="handleLinkAdd" :disabled="!linkUrl.trim()">
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
  </div>
</template>

<script setup lang="ts">
import { Link, Link2Icon, Unlink } from "lucide-vue-next";

const props = defineProps<{
  editor: any;
}>();

const linkUrl = ref("");

const hasSelection = computed(() => {
  if (!props.editor) return false;
  const { from, to } = props.editor.state.selection;
  return from !== to;
});

const isLinkActive = computed(() => {
  return props.editor?.isActive("link") ?? false;
});

const handleLinkAdd = () => {
  props.editor?.chain().focus().extendMarkRange("link").setLink({ href: linkUrl.value }).run();
  linkUrl.value = "";
};

const handleRemoveLink = () => {
  props.editor?.chain().focus().unsetLink().run();
};
</script>
