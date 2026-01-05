<template>
  <div class="w-full rounded-md" id="tiptap">
    <TeamWorkspaceToolbar :editor-instance="editorInstance" />

    <div class="w-full h-full border-x border-b rounded-b-md">
      <div class="w-full">
        <EditorContent :editor="editorInstance" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EditorContent, useEditor } from "@tiptap/vue-3";

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
