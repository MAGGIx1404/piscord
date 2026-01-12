<template>
  <main class="w-full pb-10">
    <!-- Header -->
    <CommunityCreateHeader />

    <!-- Form Content -->
    <div class="w-full mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 px-6">
      <!-- Left Column - Main Form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Basic Info -->
        <CommunityCreateBasicInfo
          v-model:name="form.name"
          v-model:slug="form.slug"
          v-model:description="form.description"
          :icon-preview="form.iconPreview"
          :banner-preview="form.bannerPreview"
          :is-generating="isGenerating"
          :slug-error="slugError"
          :is-checking-slug="isCheckingSlug"
          @trigger-icon-upload="triggerIconUpload"
          @trigger-banner-upload="triggerBannerUpload"
          @generate-description="generateAIDescription"
        />

        <!-- Hidden file inputs -->
        <input
          ref="iconInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleIconUpload"
        />
        <input
          ref="bannerInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleBannerUpload"
        />

        <!-- Category & Tags -->
        <CommunityCreateCategoryTags
          v-model:category="form.category"
          v-model:tag-input="tagInput"
          :tags="form.tags"
          :categories="categories"
          @add-tag="addTag"
          @remove-tag="removeTag"
        />

        <!-- Community Rules -->
        <CommunityCreateRules
          v-model:rule-input="ruleInput"
          :rules="form.rules"
          :suggestions="ruleSuggestions"
          @add-rule="addRule"
          @remove-rule="removeRule"
          @move-rule="moveRule"
          @add-suggested-rule="addSuggestedRule"
        />

        <!-- Privacy & Settings -->
        <CommunityCreatePrivacy
          v-model:visibility="form.visibility"
          v-model:require-approval="form.requireApproval"
          v-model:enable-welcome="form.enableWelcome"
          v-model:discoverable="form.discoverable"
        />
      </div>

      <!-- Right Column - Preview & Actions -->
      <div class="space-y-6 lg:sticky lg:top-20 lg:self-start">
        <!-- Preview Card -->
        <CommunityCreatePreview
          :name="form.name"
          :description="form.description"
          :visibility="form.visibility"
          :tags="form.tags"
          :icon-preview="form.iconPreview"
          :banner-preview="form.bannerPreview"
        />

        <!-- Guidelines -->
        <CommunityCreateGuidelines />

        <!-- Action Buttons -->
        <CommunityCreateActions
          :is-valid="isFormValid"
          :is-loading="isCreating"
          @create="handleCreate"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { Gamepad2, Code, Music, Palette, BookOpen, Briefcase, Film, Heart } from "lucide-vue-next";
import { toast } from "vue-sonner";

const router = useRouter();
const communityStore = useCommunityStore();

const iconInput = ref<HTMLInputElement | null>(null);
const bannerInput = ref<HTMLInputElement | null>(null);
const tagInput = ref("");
const ruleInput = ref("");
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

const ruleSuggestions = [
  "Be respectful to all members",
  "No spam or self-promotion",
  "No hate speech or harassment",
  "Keep discussions on topic",
  "No NSFW content"
];

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
    try {
      const { available, reason } = await $fetch("/api/community/slug-available", {
        query: { slug }
      });
      slugError.value = available ? null : reason;
    } catch {
      slugError.value = "Failed to check availability";
    } finally {
      isCheckingSlug.value = false;
    }
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

const triggerIconUpload = () => {
  iconInput.value?.click();
};

const handleIconUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }
    form.iconFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      form.iconPreview = (e.target?.result as string) || null;
    };
    reader.readAsDataURL(file);
  }
};

const triggerBannerUpload = () => {
  bannerInput.value?.click();
};

const handleBannerUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    if (file.size > 4 * 1024 * 1024) {
      toast.error("File size must be less than 4MB");
      return;
    }
    form.bannerFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      form.bannerPreview = (e.target?.result as string) || null;
    };
    reader.readAsDataURL(file);
  }
};

const generateAIDescription = async () => {
  if (!form.name.trim() || isGenerating.value) return;

  isGenerating.value = true;

  const categoryLabel = categories.find((c) => c.value === form.category)?.label || "";
  const prompts = [
    `Welcome to ${
      form.name
    }! A vibrant community where members connect, share ideas, and grow together. ${
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

const addTag = () => {
  const tag = tagInput.value.trim().toLowerCase();
  if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
    form.tags.push(tag);
    tagInput.value = "";
  }
};

const removeTag = (tag: string) => {
  form.tags = form.tags.filter((t) => t !== tag);
};

const addRule = () => {
  const text = ruleInput.value.trim();
  if (text && form.rules.length < 10 && !form.rules.some((r) => r.text === text)) {
    form.rules.push({ id: Date.now(), text });
    ruleInput.value = "";
  }
};

const addSuggestedRule = (text: string) => {
  if (form.rules.length < 10 && !form.rules.some((r) => r.text === text)) {
    form.rules.push({ id: Date.now(), text });
  }
};

const removeRule = (id: number) => {
  form.rules = form.rules.filter((r) => r.id !== id);
};

const moveRule = (index: number, direction: number) => {
  const newIndex = index + direction;
  if (newIndex >= 0 && newIndex < form.rules.length) {
    const temp = form.rules[index];
    const swapItem = form.rules[newIndex];
    if (temp && swapItem) {
      form.rules[index] = swapItem;
      form.rules[newIndex] = temp;
    }
  }
};

const handleCreate = async () => {
  if (!isFormValid.value || isCreating.value) return;

  isCreating.value = true;

  try {
    const response = await $fetch("/api/community", {
      method: "POST",
      body: {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        category: form.category,
        visibility: form.visibility,
        tags: form.tags,
        rules: form.rules.map((r) => ({ text: r.text })),
        requireApproval: form.requireApproval,
        enableWelcome: form.enableWelcome,
        discoverable: form.discoverable,
        iconBase64: form.iconPreview,
        bannerBase64: form.bannerPreview
      }
    });

    if (response.success && response.community?.slug) {
      toast.success("Community created successfully!");

      // Refresh communities list
      await communityStore.fetchCommunities(true);

      // Set the new community as current
      communityStore.setCurrentCommunity(response.community.slug);

      // Navigate to the new community
      router.push(`/community/${response.community.slug}`);
    }
  } catch (error: unknown) {
    const err = error as { data?: { statusMessage?: string } };
    toast.error(err.data?.statusMessage || "Failed to create community");
  } finally {
    isCreating.value = false;
  }
};

const handleCancel = () => {
  router.back();
};
</script>
