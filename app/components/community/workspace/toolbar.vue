<template>
  <div
    class="w-full border flex items-center gap-2 p-2 border-b flex-wrap bg-background sticky top-16 z-3 rounded-t-md"
  >
    <!-- Undo/Redo -->
    <CommunityWorkspaceEditorToolbarUndoRedo :editor="editorInstance" />

    <!-- Headings -->
    <CommunityWorkspaceEditorToolbarHeadings :editor="editorInstance" />

    <!-- Text Formatting -->
    <CommunityWorkspaceEditorToolbarFormatting :editor="editorInstance" />

    <!-- Lists & Blockquote -->
    <CommunityWorkspaceEditorToolbarLists :editor="editorInstance" />

    <!-- Links -->
    <CommunityWorkspaceEditorToolbarLinks :editor="editorInstance" />

    <!-- Inserts (HR, Table, Image) -->
    <CommunityWorkspaceEditorToolbarInserts :editor="editorInstance" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  editorInstance: any;
}>();
</script>
