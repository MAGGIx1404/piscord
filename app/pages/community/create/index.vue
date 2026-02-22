<template>
  <main class="w-full min-h-screen relative bg-background">
    <!-- Progress Header -->
    <CreateHeader
      :current-step="currentStep"
      :total-steps="totalSteps"
      :step-titles="stepTitles"
      @cancel="handleCancel"
    />

    <!-- Form Content -->
    <div class="relative px-6 py-10">
      <div class="grid lg:grid-cols-5 gap-8">
        <!-- Left: Form Steps -->
        <div class="lg:col-span-3">
          <!-- Step 1: Identity -->
          <CreateStepIdentity
            v-show="currentStep === 1"
            v-model:name="form.name"
            v-model:slug="form.slug"
            v-model:description="form.description"
            v-model:icon-preview="form.iconPreview"
            v-model:banner-preview="form.bannerPreview"
            :slug-error="slugError"
            :is-checking-slug="isCheckingSlug"
            :is-generating="isGenerating"
            @update:icon-file="form.iconFile = $event"
            @update:banner-file="form.bannerFile = $event"
            @generate-description="generateAIDescription"
          />

          <!-- Step 2: Category & Tags -->
          <CreateStepDiscovery
            v-show="currentStep === 2"
            v-model:category="form.category"
            v-model:tags="form.tags"
          />

          <!-- Step 3: Rules -->
          <CreateStepRules v-show="currentStep === 3" v-model:rules="form.rules" />

          <!-- Step 4: AI Pet -->
          <CreateStepAIPet
            v-show="currentStep === 4"
            v-model:enabled="aiPet.enabled"
            v-model:avatar="aiPet.avatar"
            v-model:name="aiPet.name"
            v-model:nickname="aiPet.nickname"
            v-model:personality="aiPet.personality"
            v-model:model="aiPet.model"
            v-model:use-custom-key="aiPet.useCustomKey"
            v-model:api-key="aiPet.apiKey"
            v-model:enabled-capabilities="aiPet.enabledCapabilities"
            @update:custom-avatar-file="aiPet.customAvatarFile = $event"
          />

          <!-- Step 5: Privacy -->
          <CreateStepSettings
            v-show="currentStep === 5"
            v-model:visibility="form.visibility"
            v-model:require-approval="form.requireApproval"
            v-model:enable-welcome="form.enableWelcome"
            v-model:discoverable="form.discoverable"
          />

          <!-- Navigation Buttons -->
          <CreateNavigation
            :current-step="currentStep"
            :total-steps="totalSteps"
            :can-proceed="canProceed"
            :is-form-valid="isFormValid"
            :is-creating="isCreating"
            @prev="currentStep--"
            @next="currentStep++"
            @create="handleCreate"
          />
        </div>

        <!-- Right: Preview -->
        <div class="lg:col-span-2 lg:sticky lg:top-24 lg:self-start space-y-6">
          <CreatePreview
            :name="form.name"
            :description="form.description"
            :icon-preview="form.iconPreview"
            :banner-preview="form.bannerPreview"
            :visibility="form.visibility"
            :tags="form.tags"
          />

          <CreateTips :current-step="currentStep" />
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  CreateHeader,
  CreateStepIdentity,
  CreateStepDiscovery,
  CreateStepRules,
  CreateStepAIPet,
  CreateStepSettings,
  CreateNavigation,
  CreatePreview,
  CreateTips
} from "~/components/community/create";
import { Gamepad2, Code, Music, Palette, BookOpen, Briefcase, Film, Heart } from "lucide-vue-next";
import { toast } from "vue-sonner";

const router = useRouter();

// Step management
const currentStep = ref(1);
const totalSteps = 5;
const stepTitles = ["Identity", "Discovery", "Rules", "AI Pet", "Settings"];

const isGenerating = ref(false);
const isCreating = ref(false);
const slugError = ref<string | null>(null);
const isCheckingSlug = ref(false);

const form = reactive({
  name: "",
  slug: "",
  description: "",
  category: "",
  tags: [] as string[],
  rules: [] as { id: number; text: string }[],
  visibility: "public" as "public" | "private",
  requireApproval: false,
  enableWelcome: true,
  discoverable: true,
  iconPreview: null as string | null,
  iconFile: null as File | null,
  bannerPreview: null as string | null,
  bannerFile: null as File | null
});

const aiPet = reactive({
  enabled: false,
  avatar: "1",
  name: "",
  nickname: "",
  personality: "",
  model: "gpt-4o-mini",
  useCustomKey: false,
  apiKey: "",
  enabledCapabilities: ["chat", "welcome"] as string[],
  customAvatarFile: null as File | null
});

const categories = [
  { value: "gaming", label: "Gaming", icon: Gamepad2 },
  { value: "technology", label: "Technology", icon: Code },
  { value: "music", label: "Music", icon: Music },
  { value: "art", label: "Art & Design", icon: Palette },
  { value: "education", label: "Education", icon: BookOpen },
  { value: "business", label: "Business", icon: Briefcase },
  { value: "entertainment", label: "Entertainment", icon: Film },
  { value: "lifestyle", label: "Lifestyle", icon: Heart }
];

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return (
        form.name.trim().length >= 3 && form.description.trim().length >= 10 && !slugError.value
      );
    case 2:
      return !!form.category;
    case 3:
      return true;
    case 4:
      // AI Pet step: if enabled, require a name
      if (aiPet.enabled) {
        return aiPet.name.trim().length >= 2;
      }
      return true;
    case 5:
      return true;
    default:
      return false;
  }
});

const isFormValid = computed(() => {
  return !!(
    form.name.trim().length >= 3 &&
    form.description.trim().length >= 10 &&
    form.category &&
    !slugError.value
  );
});

// Debounced slug availability check
let slugCheckTimeout: ReturnType<typeof setTimeout>;
const checkSlugAvailability = async (slug: string) => {
  if (!slug || slug.length < 2) {
    slugError.value = null;
    return;
  }

  clearTimeout(slugCheckTimeout);
  slugCheckTimeout = setTimeout(async () => {
    isCheckingSlug.value = true;
    await new Promise((resolve) => setTimeout(resolve, 800));
    const takenSlugs = ["test", "admin"];
    if (takenSlugs.includes(slug)) {
      slugError.value = "This URL is already taken.";
    } else {
      slugError.value = null;
    }
    isCheckingSlug.value = false;
  }, 300);
};

// Auto-generate slug from name
watch(
  () => form.name,
  (newName) => {
    const newSlug = newName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 30);
    form.slug = newSlug;
    checkSlugAvailability(newSlug);
  }
);

const generateAIDescription = async () => {
  if (!form.name.trim() || isGenerating.value) return;

  isGenerating.value = true;

  const categoryLabel = categories.find((c) => c.value === form.category)?.label || "";
  const prompts = [
    `Welcome to ${form.name}! A vibrant community where members connect, share ideas, and grow together. ${
      categoryLabel
        ? `Whether you're passionate about ${categoryLabel.toLowerCase()} or just getting started, you'll find a welcoming space here.`
        : "Join us and be part of something special!"
    }`,
    `${form.name} is your go-to destination for ${
      categoryLabel ? categoryLabel.toLowerCase() + " enthusiasts" : "like-minded individuals"
    }. Connect with fellow members, share your experiences, and discover new perspectives in a friendly, supportive environment.`,
    `Join ${form.name} – a thriving community built for connection and collaboration. ${
      categoryLabel ? `Dive into discussions about ${categoryLabel.toLowerCase()}, ` : ""
    }share your knowledge, and make lasting connections with people who share your interests.`
  ];

  await new Promise((resolve) => setTimeout(resolve, 500));
  const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)] || "";

  form.description = "";
  for (let i = 0; i < selectedPrompt.length; i++) {
    form.description += selectedPrompt[i];
    await new Promise((resolve) => setTimeout(resolve, 15));
  }

  isGenerating.value = false;
};

const handleCreate = async () => {
  isCreating.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Community created successfully!");
    console.log("Create community with data:", { ...form, aiPet: { ...aiPet } });
  } catch (error) {
    toast.error("Failed to create community");
  } finally {
    isCreating.value = false;
  }
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped>
@keyframes float-slow {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(30px, -30px) scale(1.1);
  }
}

@keyframes float-delayed {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-20px, 20px) scale(1.05);
  }
}

.animate-float-slow {
  animation: float-slow 20s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 25s ease-in-out infinite;
  animation-delay: 5s;
}
</style>
