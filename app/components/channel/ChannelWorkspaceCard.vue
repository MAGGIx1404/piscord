<template>
  <NuxtLink
    :to="workspace.url"
    class="flex items-start gap-3 p-3 mt-2 rounded-xl border border-border bg-card/60 hover:bg-accent/40 transition-colors max-w-sm w-full group cursor-pointer"
  >
    <!-- Icon -->
    <div class="size-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
      {{ workspace.emoji }}
    </div>

    <!-- Details -->
    <div class="flex-1 min-w-0 space-y-0.5">
      <div class="flex items-center gap-1.5">
        <FileText class="size-3.5 text-primary shrink-0" />
        <span class="text-sm font-semibold truncate group-hover:text-primary transition-colors">
          {{ workspace.name }}
        </span>
      </div>
      <p v-if="workspace.description" class="text-xs text-muted-foreground line-clamp-2">
        {{ workspace.description }}
      </p>
      <div class="flex items-center gap-3 pt-0.5">
        <span
          v-if="workspace.parentName"
          class="text-[11px] text-muted-foreground/70 flex items-center gap-1"
        >
          <FolderOpen class="size-3" />
          {{ workspace.parentName }}
        </span>
        <span
          v-if="workspace.updatedAt"
          class="text-[11px] text-muted-foreground/70 flex items-center gap-1"
        >
          <Clock class="size-3" />
          {{ workspace.updatedAt }}
        </span>
      </div>
    </div>

    <!-- Arrow -->
    <ExternalLink
      class="size-3.5 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 mt-1 transition-colors"
    />
  </NuxtLink>
</template>

<script setup lang="ts">
import { FileText, FolderOpen, Clock, ExternalLink } from "lucide-vue-next";

export interface ChatWorkspace {
  id: string;
  name: string;
  emoji: string;
  url: string;
  description?: string;
  parentName?: string;
  updatedAt?: string;
}

defineProps<{
  workspace: ChatWorkspace;
}>();
</script>
