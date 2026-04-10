<template>
  <div class="flex items-center justify-between border-t border-border/50 bg-card/30 px-4 py-1.5">
    <div class="flex items-center gap-3 text-[10px] text-muted-foreground/60">
      <span>{{ wordCount }} words</span>
      <span class="text-muted-foreground/20">|</span>
      <span>{{ charCount }} characters</span>
      <template v-if="readingTime > 0">
        <span class="text-muted-foreground/20">|</span>
        <span>~{{ readingTime }} min read</span>
      </template>
    </div>

    <div class="flex items-center gap-2 text-[10px]">
      <!-- Document actions -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button
            class="flex items-center gap-1 rounded-md px-2 py-0.5 text-muted-foreground/60 transition-colors hover:bg-accent hover:text-foreground"
          >
            <Download class="size-3" />
            <span>Export</span>
            <ChevronUp class="size-2.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" :side-offset="6" class="w-52">
          <DropdownMenuLabel class="text-[10px] text-muted-foreground/50">
            Export & Share
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="gap-2 text-xs" @click="$emit('downloadPdf')">
            <FileDown class="size-3.5" />
            Download as PDF
          </DropdownMenuItem>
          <DropdownMenuItem class="gap-2 text-xs" @click="$emit('downloadMd')">
            <FileText class="size-3.5" />
            Download as Markdown
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="gap-2 text-xs" @click="$emit('shareEmbed')">
            <Code2 class="size-3.5" />
            Embed (iframe)
          </DropdownMenuItem>
          <DropdownMenuItem class="gap-2 text-xs" @click="$emit('copyLink')">
            <Link class="size-3.5" />
            Copy share link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <span class="text-muted-foreground/20">|</span>

      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
      >
        <div v-if="saving" class="flex items-center gap-1 text-muted-foreground/60">
          <Loader2 class="size-3 animate-spin" />
          <span>Saving...</span>
        </div>
        <div v-else-if="saveError" class="flex items-center gap-1 text-destructive/70">
          <AlertCircle class="size-3" />
          <span>Save failed</span>
        </div>
        <div v-else-if="lastSavedAt" class="flex items-center gap-1 text-muted-foreground/50">
          <Check class="size-3" />
          <span>Saved {{ timeAgo(lastSavedAt) }}</span>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Loader2,
  AlertCircle,
  Check,
  Download,
  FileDown,
  FileText,
  Code2,
  Link,
  ChevronUp
} from "lucide-vue-next";

defineProps<{
  wordCount: number;
  charCount: number;
  readingTime: number;
  saving: boolean;
  saveError: boolean;
  lastSavedAt: Date | null;
}>();

defineEmits<{
  downloadPdf: [];
  downloadMd: [];
  shareEmbed: [];
  copyLink: [];
}>();

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}
</script>
