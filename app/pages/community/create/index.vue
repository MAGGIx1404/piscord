<template>
  <main class="relative min-h-screen w-full bg-background">
    <!-- Progress Header -->
    <CreateHeader
      :current-step="currentStep"
      :total-steps="totalSteps"
      :step-titles="stepTitles"
      @cancel="handleCancel"
    />

    <!-- Form Content -->
    <div class="relative px-6 py-10">
      <div class="grid gap-8 lg:grid-cols-5">
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
            @update:icon-file="form.iconFile = $event"
            @update:banner-file="form.bannerFile = $event"
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
            v-model:provider="aiPet.provider"
            v-model:model="aiPet.model"
            v-model:ollama-model="aiPet.ollamaModel"
            v-model:use-custom-key="aiPet.useCustomKey"
            v-model:api-key="aiPet.apiKey"
            @update:custom-avatar-file="aiPet.customAvatarFile = $event"
          />

          <!-- Step 5: Privacy -->
          <CreateStepSettings
            v-show="currentStep === 5"
            v-model:visibility="form.visibility"
            v-model:require-approval="form.requireApproval"
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
        <div class="space-y-6 lg:sticky lg:top-24 lg:col-span-2 lg:self-start">
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
import { toast } from "vue-sonner";

definePageMeta({
  layout: "entry"
});

const router = useRouter();
const api = useApi();

// Step management
const currentStep = ref(1);
const totalSteps = 5;
const stepTitles = ["Identity", "Discovery", "Rules", "AI Pet", "Settings"];

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
  provider: "puter" as "puter" | "ollama",
  model: "gpt-4o-mini",
  ollamaModel: "llama3.2:latest",
  useCustomKey: false,
  apiKey: "",
  customAvatarFile: null as File | null
});

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

// Debounced slug availability check (real API)
let slugCheckTimeout: ReturnType<typeof setTimeout>;
const checkSlugAvailability = async (slug: string) => {
  if (!slug || slug.length < 2) {
    slugError.value = null;
    return;
  }

  clearTimeout(slugCheckTimeout);
  slugCheckTimeout = setTimeout(async () => {
    isCheckingSlug.value = true;
    try {
      const res = await $fetch<{ available: boolean }>("/api/communities/check-slug", {
        query: { slug }
      });
      slugError.value = res.available ? null : "This URL is already taken.";
    } catch {
      slugError.value = null; // don't block the user on network errors
    } finally {
      isCheckingSlug.value = false;
    }
  }, 400);
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

const handleCreate = async () => {
  isCreating.value = true;
  try {
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("slug", form.slug);
    fd.append("description", form.description);
    fd.append("category", form.category);
    fd.append("visibility", form.visibility);
    fd.append("tags", JSON.stringify(form.tags));
    fd.append("rules", JSON.stringify(form.rules));
    fd.append("requireApproval", String(form.requireApproval));

    if (form.iconFile) fd.append("icon", form.iconFile);
    if (form.bannerFile) fd.append("banner", form.bannerFile);

    // AI Agent
    fd.append("isAiPet", String(aiPet.enabled));
    if (aiPet.enabled) {
      fd.append("aiProvider", aiPet.provider);
      fd.append("aiAgentName", aiPet.name);
      fd.append("aiAgentPetName", aiPet.nickname);
      fd.append("aiAgentModel", aiPet.model);
      if (aiPet.provider === "ollama") {
        fd.append("aiOllamaModel", aiPet.ollamaModel);
      }
      fd.append("aiAgentDescription", aiPet.personality);
      if (aiPet.customAvatarFile) {
        fd.append("aiAgentAvatarFile", aiPet.customAvatarFile);
      } else {
        fd.append("aiAgentAvatar", aiPet.avatar);
      }
    }

    const res = await api<{ community: { id: string; slug: string } }>("/api/communities", {
      method: "POST",
      body: fd
    });

    toast.success("Community created successfully!");
    await router.push(`/community/${res.community.slug}`);
  } catch (error: any) {
    toast.error(error?.data?.message ?? "Failed to create community.");
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
