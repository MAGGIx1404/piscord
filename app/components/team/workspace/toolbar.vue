<template>
  <div
    class="w-full border flex items-center gap-2 p-2 border-b flex-wrap bg-background sticky top-16 z-3 rounded-t-md"
  >
    <!-- Undo/Redo -->
    <TeamWorkspaceEditorToolbarUndoRedo :editor="editorInstance" />

    <!-- Headings -->
    <TeamWorkspaceEditorToolbarHeadings :editor="editorInstance" />

    <!-- Text Formatting -->
    <TeamWorkspaceEditorToolbarFormatting :editor="editorInstance" />

    <!-- Lists & Blockquote -->
    <TeamWorkspaceEditorToolbarLists :editor="editorInstance" />

    <!-- Links -->
    <TeamWorkspaceEditorToolbarLinks :editor="editorInstance" />

    <!-- Inserts (HR, Table, Image) -->
    <TeamWorkspaceEditorToolbarInserts :editor="editorInstance" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  editorInstance: any;
}>();
</script>
