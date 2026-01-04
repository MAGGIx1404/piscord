<template>
  <div class="w-full border rounded-md" id="tiptap">
    <TeamWorkspaceEditorToolbar />

    <div class="w-full h-full">
      <div class="w-full">
        <EditorContent :editor="editorInstance" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { tiptapExtensions } from "#imports";

const model = defineModel<String>({
  required: true,
  default: ""
});

const editorInstance = useEditor({
  content: model.value,
  editorProps: {
    attributes: {
      class: "tiptap-prose"
    }
  },
  onUpdate: ({ editor }) => {
    model.value = editor.getHTML();
  },
  extensions: tiptapExtensions()
});
</script>
