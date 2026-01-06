<template>
  <NodeViewWrapper as="div" class="code-block-wrapper relative group">
    <Select v-model="selectedLanguage">
      <SelectTrigger
        class="absolute top-2 right-2 w-auto min-w-[100px] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-10 border"
      >
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="lang in languages" :key="lang.value" :value="lang.value">
          {{ lang.label }}
        </SelectItem>
      </SelectContent>
    </Select>
    <pre><NodeViewContent as="code" /></pre>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { NodeViewWrapper, NodeViewContent } from "@tiptap/vue-3";

const props = defineProps<{
  node: any;
  updateAttributes: (attributes: Record<string, any>) => void;
  extension: any;
}>();

const languages = [
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "bash", label: "Bash" },
  { value: "shell", label: "Shell" },
  { value: "powershell", label: "PowerShell" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "graphql", label: "GraphQL" }
];

const selectedLanguage = computed({
  get: () => props.node.attrs.language || "plaintext",
  set: (language: string) => props.updateAttributes({ language })
});
</script>

<style scoped>
.code-block-wrapper {
  position: relative;
}

.code-block-wrapper pre {
  margin: 0;
}
</style>
