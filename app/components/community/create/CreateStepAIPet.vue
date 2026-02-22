<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">Create your AI Pet</h2>
      <p class="text-muted-foreground">
        Set up a personal AI agent for your community to help moderate, answer questions, and engage
        with members.
      </p>
    </div>

    <!-- Enable AI Pet Toggle -->
    <div class="rounded-2xl bg-card/50 border border-border/50 p-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div
            class="size-12 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center"
          >
            <Bot class="size-6 text-white" />
          </div>
          <div>
            <p class="font-semibold text-lg">Enable AI Pet</p>
            <p class="text-sm text-muted-foreground">Add an AI assistant to your community</p>
          </div>
        </div>
        <Switch v-on:update:model-value="enabled = $event" />
      </div>
    </div>

    <!-- AI Pet Configuration (shown when enabled) -->
    <div v-if="enabled" class="space-y-6">
      <!-- Avatar Selection -->
      <div class="space-y-3">
        <Label class="text-sm font-medium">Choose Avatar</Label>
        <div class="flex flex-wrap gap-3">
          <!-- Render uploaded avatar so it appears in the list -->
          <button
            v-if="customAvatarPreview"
            key="custom-avatar"
            @click="avatar = customAvatarPreview"
            class="relative size-16 rounded-xl overflow-hidden border-2 transition-all hover:scale-105"
            :class="[
              avatar === customAvatarPreview
                ? 'border-primary ring-2 ring-primary/30'
                : 'border-border hover:border-primary/50'
            ]"
          >
            <img :src="customAvatarPreview" alt="Custom avatar" class="size-full object-cover" />
            <div
              v-if="avatar === customAvatarPreview"
              class="absolute inset-0 bg-primary/20 flex items-center justify-center"
            >
              <Check class="size-5 text-primary" />
            </div>
          </button>

          <button
            v-for="avatarOption in avatarOptions"
            :key="avatarOption"
            @click="avatar = avatarOption"
            class="relative size-16 rounded-xl overflow-hidden border-2 transition-all hover:scale-105"
            :class="[
              avatar === avatarOption
                ? 'border-primary ring-2 ring-primary/30'
                : 'border-border hover:border-primary/50'
            ]"
          >
            <img
              :src="`/images/avatar/${avatarOption}.png`"
              :alt="`Avatar ${avatarOption}`"
              class="size-full object-cover"
            />
            <div
              v-if="avatar === avatarOption"
              class="absolute inset-0 bg-primary/20 flex items-center justify-center"
            >
              <Check class="size-5 text-primary" />
            </div>
          </button>

          <!-- Custom upload option -->
          <label
            class="relative size-16 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center cursor-pointer transition-all hover:scale-105"
          >
            <input
              type="file"
              accept="image/*"
              class="sr-only"
              @change="handleCustomAvatarUpload"
            />
            <Upload class="size-5 text-muted-foreground" />
          </label>
        </div>
        <p class="text-xs text-muted-foreground">Select a preset avatar or upload your own</p>
      </div>

      <!-- Pet Name -->
      <div class="space-y-2">
        <Label for="pet-name" class="text-sm font-medium">Pet Name</Label>
        <Input
          id="pet-name"
          v-model="petName"
          placeholder="e.g., Buddy, Nova, Pixel"
          class="h-12"
          maxlength="32"
        />
        <p class="text-xs text-muted-foreground">
          This is the display name of your AI assistant ({{ petName?.length || 0 }}/32)
        </p>
      </div>

      <!-- Pet Nickname -->
      <div class="space-y-2">
        <Label for="pet-nickname" class="text-sm font-medium">Nickname (Optional)</Label>
        <Input
          id="pet-nickname"
          v-model="nickname"
          placeholder="e.g., @buddy, @nova-bot"
          class="h-12"
          maxlength="20"
        />
        <p class="text-xs text-muted-foreground">
          A short handle members can use to mention the pet
        </p>
      </div>

      <!-- Personality/Role -->
      <div class="space-y-2">
        <Label for="pet-personality" class="text-sm font-medium">Personality & Role</Label>
        <Textarea
          id="pet-personality"
          v-model="personality"
          placeholder="Describe how your AI pet should behave and what it should help with..."
          class="min-h-[100px] resize-none"
          maxlength="500"
        />
        <p class="text-xs text-muted-foreground">
          Define the personality and responsibilities ({{ personality?.length || 0 }}/500)
        </p>
      </div>

      <!-- AI Model Selection -->
      <div class="space-y-3">
        <Label class="text-sm font-medium">AI Model</Label>
        <div class="grid md:grid-cols-2 gap-3">
          <button
            v-for="modelOption in aiModels"
            :key="modelOption.value"
            @click="aiModel = modelOption.value"
            class="relative p-4 rounded-xl border-2 transition-all text-left"
            :class="[
              aiModel === modelOption.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            ]"
          >
            <div
              v-if="aiModel === modelOption.value"
              class="absolute top-3 right-3 size-5 rounded-full bg-primary flex items-center justify-center"
            >
              <Check class="size-3 text-white" />
            </div>
            <div class="flex items-center gap-3 mb-2">
              <component :is="modelOption.icon" class="size-5" :class="modelOption.iconColor" />
              <span class="font-medium">{{ modelOption.label }}</span>
            </div>
            <p class="text-xs text-muted-foreground">{{ modelOption.description }}</p>
          </button>
        </div>
      </div>

      <!-- API Key Section -->
      <div class="space-y-4 rounded-2xl bg-card/50 border border-border/50 p-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Key class="size-5 text-amber-500" />
            </div>
            <div>
              <p class="font-medium">Use Custom API Key</p>
              <p class="text-sm text-muted-foreground">Bring your own API key for more control</p>
            </div>
          </div>
          <Switch v-on:update:model-value="useCustomKey = $event" />
        </div>

        <div v-if="useCustomKey" class="space-y-4 pt-4 border-t border-border/50">
          <div class="space-y-2">
            <Label for="api-key" class="text-sm font-medium">API Key</Label>
            <div class="relative">
              <Input
                id="api-key"
                :type="showApiKey ? 'text' : 'password'"
                v-model="apiKey"
                placeholder="sk-..."
                class="h-12 pr-12 font-mono text-sm"
              />
              <button
                type="button"
                @click="showApiKey = !showApiKey"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <EyeOff v-if="showApiKey" class="size-5" />
                <Eye v-else class="size-5" />
              </button>
            </div>
            <p class="text-xs text-muted-foreground">
              Your API key is encrypted and stored securely
            </p>
          </div>

          <div
            class="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
          >
            <AlertTriangle class="size-4 text-amber-500 shrink-0 mt-0.5" />
            <p class="text-xs text-amber-600 dark:text-amber-400">
              API usage will be billed directly to your account. Keep your key secure and never
              share it publicly.
            </p>
          </div>
        </div>
      </div>

      <!-- Capabilities -->
      <div class="space-y-3">
        <Label class="text-sm font-medium">Capabilities</Label>
        <div class="grid gap-2">
          <div
            v-for="capability in capabilities"
            :key="capability.id"
            class="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/50"
          >
            <div class="flex items-center gap-3">
              <component :is="capability.icon" class="size-5 text-muted-foreground" />
              <div>
                <p class="font-medium text-sm">{{ capability.label }}</p>
                <p class="text-xs text-muted-foreground">{{ capability.description }}</p>
              </div>
            </div>
            <Switch
              v-on:update:model-value="toggleCapability(capability.id, $event)"
              :model-value="enabledCapabilities.includes(capability.id)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Bot,
  Check,
  Upload,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  Sparkles,
  Zap,
  Brain,
  MessageCircle,
  Shield,
  HelpCircle,
  Wand2
} from "lucide-vue-next";

interface AIModel {
  value: string;
  label: string;
  description: string;
  icon: any;
  iconColor: string;
}

interface Capability {
  id: string;
  label: string;
  description: string;
  icon: any;
}

const enabled = defineModel<boolean>("enabled", { required: true });
const avatar = defineModel<string>("avatar", { required: true });
const petName = defineModel<string>("name", { required: true });
const nickname = defineModel<string>("nickname", { required: true });
const personality = defineModel<string>("personality", { required: true });
const aiModel = defineModel<string>("model", { required: true });
const useCustomKey = defineModel<boolean>("useCustomKey", { required: true });
const apiKey = defineModel<string>("apiKey", { required: true });
const enabledCapabilities = defineModel<string[]>("enabledCapabilities", { required: true });

const emit = defineEmits<{
  "update:customAvatarFile": [value: File | null];
}>();

const showApiKey = ref(false);
const customAvatarPreview = ref<string | null>(null);

const avatarOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const aiModels: AIModel[] = [
  {
    value: "gpt-4o",
    label: "GPT-4o",
    description: "Most capable, best for complex tasks",
    icon: Sparkles,
    iconColor: "text-emerald-500"
  },
  {
    value: "gpt-4o-mini",
    label: "GPT-4o Mini",
    description: "Fast and cost-effective",
    icon: Zap,
    iconColor: "text-blue-500"
  },
  {
    value: "claude-3-5-sonnet",
    label: "Claude 3.5 Sonnet",
    description: "Excellent reasoning and safety",
    icon: Brain,
    iconColor: "text-purple-500"
  },
  {
    value: "gemini-pro",
    label: "Gemini Pro",
    description: "Multi-modal capabilities",
    icon: Wand2,
    iconColor: "text-amber-500"
  }
];

const capabilities: Capability[] = [
  {
    id: "chat",
    label: "Chat & Conversation",
    description: "Engage in natural conversations with members",
    icon: MessageCircle
  },
  {
    id: "moderation",
    label: "Auto-Moderation",
    description: "Help moderate content and enforce rules",
    icon: Shield
  },
  {
    id: "qa",
    label: "Q&A Assistant",
    description: "Answer frequently asked questions",
    icon: HelpCircle
  },
  {
    id: "welcome",
    label: "Welcome New Members",
    description: "Greet and onboard new community members",
    icon: Sparkles
  }
];

const toggleCapability = (id: string, isEnabled: boolean) => {
  if (isEnabled) {
    enabledCapabilities.value = [...enabledCapabilities.value, id];
  } else {
    enabledCapabilities.value = enabledCapabilities.value.filter((c) => c !== id);
  }
};

const handleCustomAvatarUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    emit("update:customAvatarFile", file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      customAvatarPreview.value = result;
      avatar.value = result;
    };
    reader.readAsDataURL(file);
  }
};

watch(
  avatar,
  (val) => {
    if (val && !avatarOptions.includes(val) && val.startsWith("data:")) {
      customAvatarPreview.value = val;
    }
  },
  { immediate: true }
);
</script>
