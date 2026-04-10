<template>
  <main class="relative min-h-screen w-full bg-background">
    <CreateHeader
      :current-step="currentStep"
      :total-steps="totalSteps"
      :step-titles="stepTitles"
      @cancel="handleCancel"
    />

    <div class="relative px-6 py-10">
      <div class="grid gap-8 lg:grid-cols-5">
        <div class="lg:col-span-3">
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

          <CreateStepDiscovery
            v-show="currentStep === 2"
            v-model:category="form.category"
            v-model:tags="form.tags"
          />

          <CreateStepRules v-show="currentStep === 3" v-model:rules="form.rules" />

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
            @update:custom-avatar-file="aiPet.customAvatarFile = $event"
          />

          <CreateStepSettings
            v-show="currentStep === 5"
            v-model:visibility="form.visibility"
            v-model:require-approval="form.requireApproval"
          />

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
  model: "gpt-4o-mini",
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
      slugError.value = null;
    } finally {
      isCheckingSlug.value = false;
    }
  }, 400);
};

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

    fd.append("isAiPet", String(aiPet.enabled));
    if (aiPet.enabled) {
      fd.append("aiAgentName", aiPet.name);
      fd.append("aiAgentPetName", aiPet.nickname);
      fd.append("aiAgentModel", aiPet.model);
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
