<template>
  <div class="px-4 pt-16 pb-6">
    <div class="flex flex-col items-start gap-4">
      <!-- Channel Icon -->
      <div class="size-16 rounded-full flex items-center justify-center" :class="iconBgClass">
        <component :is="channelIcon" class="size-8" :class="iconClass" />
      </div>

      <!-- Welcome Header -->
      <div class="space-y-2">
        <h1 class="text-3xl font-bold">
          {{ isDirectMessage ? "" : "Welcome to " }}{{ prefix }} {{ name }} {{ suffix }}
        </h1>
        <p class="text-muted-foreground text-base max-w-xl">
          {{ description }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div v-if="showActions" class="flex items-center gap-2">
        <slot name="actions">
          <Button v-if="!isDirectMessage" variant="outline" @click="$emit('editChannel')">
            <Pencil class="size-4" />
            Edit Channel
          </Button>
          <Button v-if="!isDirectMessage" variant="outline" @click="$emit('inviteMembers')">
            <UserPlus class="size-4" />
            Invite People
          </Button>
          <Button v-if="isDirectMessage" variant="outline" @click="$emit('viewProfile')">
            <User class="size-4" />
            View Profile
          </Button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Hash, Volume2, Megaphone, Lock, User, Pencil, UserPlus } from "lucide-vue-next";
import { computed, type Component } from "vue";

type ChannelType = "text" | "voice" | "announcement" | "private" | "dm";

interface Props {
  name: string;
  description?: string;
  type?: ChannelType;
  isDirectMessage?: boolean;
  showActions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  description: "This is the start of your conversation.",
  type: "text",
  isDirectMessage: false,
  showActions: true
});

defineEmits<{
  editChannel: [];
  inviteMembers: [];
  viewProfile: [];
}>();

const channelIcons: Record<ChannelType, Component> = {
  text: Hash,
  voice: Volume2,
  announcement: Megaphone,
  private: Lock,
  dm: User
};

const channelIcon = computed(() => {
  if (props.isDirectMessage) return User;
  return channelIcons[props.type] || Hash;
});

const iconBgClass = computed(() => {
  if (props.isDirectMessage) return "bg-primary/10";
  switch (props.type) {
    case "voice":
      return "bg-green-500/10";
    case "announcement":
      return "bg-yellow-500/10";
    case "private":
      return "bg-red-500/10";
    default:
      return "bg-muted";
  }
});

const iconClass = computed(() => {
  if (props.isDirectMessage) return "text-primary";
  switch (props.type) {
    case "voice":
      return "text-green-500";
    case "announcement":
      return "text-yellow-500";
    case "private":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
});

const prefix = computed(() => {
  if (props.isDirectMessage) return "";
  return "#";
});

const suffix = computed(() => {
  if (props.isDirectMessage) return "!";
  return "!";
});
</script>
