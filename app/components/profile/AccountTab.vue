<template>
  <div class="max-w-lg space-y-4">
    <div class="space-y-3 rounded-xl border border-border/60 bg-card p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold">Username</p>
          <p class="text-xs text-muted-foreground">Your unique handle on the platform</p>
        </div>
        <Button variant="ghost" size="sm" class="text-xs" @click="$emit('edit')">
          <Pencil class="mr-1.5 size-3" /> Edit
        </Button>
      </div>
      <div class="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
        <AtSign class="size-3.5 shrink-0 text-muted-foreground" />
        <span class="font-mono text-sm">{{ user?.username }}</span>
      </div>
    </div>

    <div class="space-y-3 rounded-xl border border-border/60 bg-card p-4">
      <div>
        <p class="text-sm font-semibold">Email</p>
        <p class="text-xs text-muted-foreground">Your account email address</p>
      </div>
      <div class="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
        <Mail class="size-3.5 shrink-0 text-muted-foreground" />
        <span class="text-sm">{{ user?.email }}</span>
      </div>
    </div>

    <div class="rounded-xl border border-border/60 bg-card p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold">Two-Factor Auth</p>
          <p class="text-xs text-muted-foreground">Extra security on your account</p>
        </div>
        <span
          class="rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
          :class="
            user?.is_2fa_enabled
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-border bg-muted/40 text-muted-foreground'
          "
        >
          {{ user?.is_2fa_enabled ? "Enabled" : "Disabled" }}
        </span>
      </div>
    </div>

    <div class="space-y-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
      <p class="text-sm font-semibold text-destructive">Danger Zone</p>
      <p class="text-xs text-muted-foreground">Permanently delete your account and all data.</p>
      <Button variant="destructive" size="sm" class="text-xs" disabled> Delete Account </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pencil, AtSign, Mail } from "lucide-vue-next";

defineProps<{
  user: {
    username: string;
    email: string;
    is_2fa_enabled: boolean;
  } | null;
}>();

defineEmits<{
  edit: [];
}>();
</script>
