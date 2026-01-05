<template>
  <main class="w-full pb-10">
    <!-- Header -->
    <div class="w-full relative">
      <div
        class="relative h-60 overflow-hidden rounded-lg bg-linear-to-r from-primary/20 via-purple-500/20 to-pink-500/20"
      >
        <div
          class="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent"
        />
      </div>

      <!-- Page Header -->
      <div class="w-full -mt-24 relative z-10 px-6">
        <Card class="p-6 backdrop-blur-xl bg-card/90 shadow-2xl">
          <div class="flex items-center gap-4">
            <div class="size-16 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles class="size-8 text-primary" />
            </div>
            <div>
              <h1 class="text-2xl font-bold">Create Your Community</h1>
              <p class="text-muted-foreground">
                Build a space for your community to connect, share, and grow together.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <!-- Form Content -->
    <div class="w-full mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 px-6">
      <!-- Left Column - Main Form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Basic Info -->
        <Card class="p-6">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Info class="size-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Give your community a unique identity that members will recognize.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <!-- Community Icon Upload -->
            <div class="space-y-2">
              <Label>Community Icon</Label>
              <div class="flex items-center gap-4">
                <div
                  class="size-24 rounded-xl border-2 border-dashed border-input flex items-center justify-center cursor-pointer hover:border-primary transition-colors relative overflow-hidden group"
                  @click="triggerIconUpload"
                >
                  <img
                    v-if="form.iconPreview"
                    :src="form.iconPreview"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="flex flex-col items-center gap-1 text-muted-foreground">
                    <ImagePlus class="size-6" />
                    <span class="text-xs">Upload</span>
                  </div>
                  <div
                    v-if="form.iconPreview"
                    class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera class="size-6 text-white" />
                  </div>
                </div>
                <input
                  ref="iconInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleIconUpload"
                />
                <div class="text-sm text-muted-foreground">
                  <p>Recommended: 256x256px</p>
                  <p>Max file size: 2MB</p>
                </div>
              </div>
            </div>

            <!-- Community Banner/Poster -->
            <div class="space-y-2">
              <Label>Community Banner</Label>
              <div
                class="w-full h-32 rounded-xl border-2 border-dashed border-input flex items-center justify-center cursor-pointer hover:border-primary transition-colors relative overflow-hidden group"
                @click="triggerBannerUpload"
              >
                <img
                  v-if="form.bannerPreview"
                  :src="form.bannerPreview"
                  class="w-full h-full object-cover"
                />
                <div v-else class="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImagePlus class="size-8" />
                  <span class="text-sm">Upload banner image</span>
                  <span class="text-xs">Recommended: 1200x400px</span>
                </div>
                <div
                  v-if="form.bannerPreview"
                  class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera class="size-8 text-white" />
                </div>
              </div>
              <input
                ref="bannerInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleBannerUpload"
              />
              <p class="text-xs text-muted-foreground">Max file size: 4MB</p>
            </div>

            <div class="w-full grid grid-cols-2 gap-6">
              <!-- Community Name -->
              <div class="space-y-2">
                <Label for="name">Community Name <span class="text-destructive">*</span></Label>
                <Input
                  id="name"
                  v-model="form.name"
                  placeholder="Enter community name"
                  maxlength="50"
                />
                <p class="text-xs text-muted-foreground">{{ form.name.length }}/50 characters</p>
              </div>

              <!-- Community URL -->
              <div class="space-y-2">
                <Label for="slug">Community URL</Label>

                <ButtonGroup class="gap-0! w-full h-10.5">
                  <ButtonGroupText as-child>
                    <Label for="url">piscord.com/c/</Label>
                  </ButtonGroupText>
                  <InputGroup class="h-full">
                    <InputGroupInput id="slug" v-model="form.slug" placeholder="your-community" />
                    <InputGroupAddon align="inline-end">
                      <Link2Icon />
                    </InputGroupAddon>
                  </InputGroup>
                </ButtonGroup>
                <p class="text-xs text-muted-foreground">
                  Only lowercase letters, numbers, and hyphens allowed.
                </p>
              </div>
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label for="description">Description <span class="text-destructive">*</span></Label>
                <Button
                  variant="ghost"
                  size="sm"
                  class="h-7 gap-1.5 text-primary hover:text-primary"
                  @click="generateAIDescription"
                  :disabled="isGenerating || !form.name.trim()"
                >
                  <Sparkles class="size-3.5" :class="{ 'animate-pulse': isGenerating }" />
                  {{ isGenerating ? "Generating..." : "AI Generate" }}
                </Button>
              </div>
              <div class="relative">
                <Textarea
                  id="description"
                  v-model="form.description"
                  placeholder="Tell people what your community is about..."
                  rows="4"
                  maxlength="500"
                  class="min-h-20"
                  :disabled="isGenerating"
                />
                <div
                  v-if="isGenerating"
                  class="absolute inset-0 bg-background/50 rounded-md flex items-center justify-center"
                >
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 class="size-4 animate-spin" />
                    <span>AI is writing...</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <p class="text-xs text-muted-foreground">
                  {{ form.description.length }}/500 characters
                </p>
                <Tooltip v-if="form.name.trim()">
                  <TooltipTrigger asChild>
                    <button
                      class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Wand2 class="size-3" />
                      AI tips
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" class="max-w-xs">
                    <p>
                      Click "AI Generate" to create a description based on your community name and
                      category.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Category & Tags -->
        <Card class="p-6">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Tag class="size-5" />
              Category & Tags
            </CardTitle>
            <CardDescription>
              Help people discover your community by choosing relevant categories and tags.
            </CardDescription>
          </CardHeader>
          <CardContent class="grid grid-cols-2 gap-6">
            <!-- Category -->
            <div class="space-y-2">
              <Label>Category <span class="text-destructive">*</span></Label>
              <Select v-model="form.category">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="category in categories"
                    :key="category.value"
                    :value="category.value"
                  >
                    <div class="flex items-center gap-2">
                      <component :is="category.icon" class="size-4" />
                      {{ category.label }}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p class="text-xs text-muted-foreground">
                Choose the category that best fits your community.
              </p>
            </div>

            <!-- Tags -->
            <div class="space-y-2">
              <Label>Tags</Label>
              <ButtonGroup class="gap-0! w-full">
                <InputGroup class="h-full">
                  <InputGroupInput
                    v-model="tagInput"
                    placeholder="Add a tag..."
                    @keydown.enter.prevent="addTag"
                    :disabled="form.tags.length >= 5"
                  />
                </InputGroup>
                <ButtonGroupText
                  @click="addTag"
                  :disabled="!tagInput.trim() || form.tags.length >= 5"
                >
                  <Plus class="size-4" />
                </ButtonGroupText>
              </ButtonGroup>

              <div v-if="form.tags.length !== 0" class="flex flex-wrap gap-2 mb-2">
                <Badge
                  v-for="tag in form.tags"
                  :key="tag"
                  class="cursor-pointer"
                  @click="removeTag(tag)"
                >
                  {{ tag }}
                  <X class="size-3" />
                </Badge>
              </div>

              <p class="text-xs text-muted-foreground">Add up to 5 tags. Press Enter to add.</p>
            </div>
          </CardContent>
        </Card>

        <!-- Privacy & Settings -->
        <Card class="p-6">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Shield class="size-5" />
              Privacy & Settings
            </CardTitle>
            <CardDescription> Control who can see and join your community. </CardDescription>
          </CardHeader>

          <CardContent class="space-y-6">
            <!-- Visibility -->
            <div class="space-y-3">
              <Label>Community Visibility</Label>
              <div class="grid grid-cols-2 gap-4">
                <!-- Public Option -->
                <div
                  class="relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 group"
                  :class="[
                    form.visibility === 'public'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-input hover:border-green-500/50 hover:bg-green-500/5'
                  ]"
                  @click="form.visibility = 'public'"
                >
                  <div v-if="form.visibility === 'public'" class="absolute top-3 right-3">
                    <div class="size-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check class="size-3 text-white" />
                    </div>
                  </div>
                  <div
                    class="size-12 rounded-xl flex items-center justify-center mb-3 transition-colors"
                    :class="
                      form.visibility === 'public'
                        ? 'bg-green-500/20'
                        : 'bg-muted group-hover:bg-green-500/10'
                    "
                  >
                    <Globe
                      class="size-6 transition-colors"
                      :class="
                        form.visibility === 'public'
                          ? 'text-green-500'
                          : 'text-muted-foreground group-hover:text-green-500'
                      "
                    />
                  </div>
                  <h4 class="font-semibold mb-1">Public</h4>
                  <p class="text-xs text-muted-foreground">
                    Anyone can discover and join your community freely.
                  </p>
                </div>

                <!-- Private Option -->
                <div
                  class="relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 group"
                  :class="[
                    form.visibility === 'private'
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-input hover:border-amber-500/50 hover:bg-amber-500/5'
                  ]"
                  @click="form.visibility = 'private'"
                >
                  <div v-if="form.visibility === 'private'" class="absolute top-3 right-3">
                    <div class="size-5 rounded-full bg-amber-500 flex items-center justify-center">
                      <Check class="size-3 text-white" />
                    </div>
                  </div>
                  <div
                    class="size-12 rounded-xl flex items-center justify-center mb-3 transition-colors"
                    :class="
                      form.visibility === 'private'
                        ? 'bg-amber-500/20'
                        : 'bg-muted group-hover:bg-amber-500/10'
                    "
                  >
                    <Lock
                      class="size-6 transition-colors"
                      :class="
                        form.visibility === 'private'
                          ? 'text-amber-500'
                          : 'text-muted-foreground group-hover:text-amber-500'
                      "
                    />
                  </div>
                  <h4 class="font-semibold mb-1">Private</h4>
                  <p class="text-xs text-muted-foreground">
                    Only invited members can access your community.
                  </p>
                </div>
              </div>
            </div>

            <!-- Additional Settings -->
            <Separator />

            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="space-y-0.5">
                  <Label class="flex items-center gap-2">
                    <UserCheck class="size-4" />
                    Require Approval
                  </Label>
                  <p class="text-sm text-muted-foreground">
                    New members need admin approval to join.
                  </p>
                </div>
                <Switch v-model:checked="form.requireApproval" />
              </div>

              <div class="flex items-center justify-between">
                <div class="space-y-0.5">
                  <Label class="flex items-center gap-2">
                    <MessageSquare class="size-4" />
                    Enable Welcome Message
                  </Label>
                  <p class="text-sm text-muted-foreground">
                    Send a welcome message to new members.
                  </p>
                </div>
                <Switch v-model:checked="form.enableWelcome" />
              </div>

              <div class="flex items-center justify-between">
                <div class="space-y-0.5">
                  <Label class="flex items-center gap-2">
                    <Bell class="size-4" />
                    Discoverable
                  </Label>
                  <p class="text-sm text-muted-foreground">
                    Show community in search results and discovery.
                  </p>
                </div>
                <Switch v-model:checked="form.discoverable" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Right Column - Preview & Actions -->
      <div class="space-y-6 lg:sticky lg:top-20 lg:self-start">
        <!-- Preview Card -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Eye class="size-5" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="border rounded-xl overflow-hidden">
              <!-- Preview Banner -->
              <div class="h-20 relative overflow-hidden">
                <img
                  v-if="form.bannerPreview"
                  :src="form.bannerPreview"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full bg-linear-to-r from-primary/30 via-purple-500/30 to-pink-500/30"
                />
              </div>
              <!-- Preview Content -->
              <div class="p-4 -mt-8">
                <div class="size-16 rounded-xl bg-card border-4 border-card overflow-hidden">
                  <img
                    v-if="form.iconPreview"
                    :src="form.iconPreview"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full bg-muted flex items-center justify-center">
                    <Users class="size-6 text-muted-foreground" />
                  </div>
                </div>
                <h3 class="font-semibold mt-2">{{ form.name || "Community Name" }}</h3>
                <p class="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {{ form.description || "Your community description will appear here..." }}
                </p>
                <div class="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span class="flex items-center gap-1">
                    <Users class="size-3" />
                    0 members
                  </span>
                  <span class="flex items-center gap-1">
                    <component :is="form.visibility === 'public' ? Globe : Lock" class="size-3" />
                    {{ form.visibility === "public" ? "Public" : "Private" }}
                  </span>
                </div>
                <div class="flex flex-wrap gap-1 mt-3" v-if="form.tags.length > 0">
                  <Badge v-for="tag in form.tags" :key="tag" variant="secondary" class="text-xs">
                    {{ tag }}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Guidelines -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <ScrollText class="size-5" />
              Community Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3 text-sm text-muted-foreground">
            <div class="flex gap-2">
              <CheckCircle class="size-4 text-green-500 shrink-0 mt-0.5" />
              <span>Choose a unique and appropriate name</span>
            </div>
            <div class="flex gap-2">
              <CheckCircle class="size-4 text-green-500 shrink-0 mt-0.5" />
              <span>Write a clear description of your community</span>
            </div>
            <div class="flex gap-2">
              <CheckCircle class="size-4 text-green-500 shrink-0 mt-0.5" />
              <span>Select relevant category and tags</span>
            </div>
            <div class="flex gap-2">
              <CheckCircle class="size-4 text-green-500 shrink-0 mt-0.5" />
              <span>No hate speech or harmful content</span>
            </div>
            <div class="flex gap-2">
              <CheckCircle class="size-4 text-green-500 shrink-0 mt-0.5" />
              <span>Respect intellectual property rights</span>
            </div>
          </CardContent>
        </Card>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <Button class="w-full" size="lg" :disabled="!isFormValid" @click="handleCreate">
            <Rocket class="size-5 mr-2" />
            Create Community
          </Button>
          <Button variant="outline" class="w-full" @click="handleCancel"> Cancel </Button>
          <p class="text-xs text-center text-muted-foreground">
            By creating a community, you agree to our
            <a href="#" class="text-primary hover:underline">Terms of Service</a>
            and
            <a href="#" class="text-primary hover:underline">Community Guidelines</a>.
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import {
  Sparkles,
  Info,
  ImagePlus,
  Camera,
  Tag,
  X,
  Plus,
  Shield,
  Globe,
  Lock,
  UserCheck,
  MessageSquare,
  Bell,
  Eye,
  Users,
  ScrollText,
  CheckCircle,
  Rocket,
  Gamepad2,
  Code,
  Music,
  Palette,
  BookOpen,
  Briefcase,
  Film,
  Heart,
  Loader2,
  Wand2,
  Link2Icon,
  Check
} from "lucide-vue-next";

const router = useRouter();

const iconInput = ref(null);
const bannerInput = ref(null);
const tagInput = ref("");
const isGenerating = ref(false);

const form = reactive({
  name: "",
  slug: "",
  description: "",
  category: "",
  tags: [],
  visibility: "public",
  requireApproval: false,
  enableWelcome: true,
  discoverable: true,
  iconPreview: null,
  iconFile: null,
  bannerPreview: null,
  bannerFile: null
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

const isFormValid = computed(() => {
  return form.name.trim().length >= 3 && form.description.trim().length >= 10 && form.category;
});

// Auto-generate slug from name
watch(
  () => form.name,
  (newName) => {
    form.slug = newName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 30);
  }
);

const triggerIconUpload = () => {
  iconInput.value?.click();
};

const handleIconUpload = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB");
      return;
    }
    form.iconFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      form.iconPreview = e.target?.result;
    };
    reader.readAsDataURL(file);
  }
};

const triggerBannerUpload = () => {
  bannerInput.value?.click();
};

const handleBannerUpload = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    if (file.size > 4 * 1024 * 1024) {
      alert("File size must be less than 4MB");
      return;
    }
    form.bannerFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      form.bannerPreview = e.target?.result;
    };
    reader.readAsDataURL(file);
  }
};

const generateAIDescription = async () => {
  if (!form.name.trim() || isGenerating.value) return;

  isGenerating.value = true;

  // Simulate AI generation (replace with actual API call)
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

  // Simulate typing effect
  await new Promise((resolve) => setTimeout(resolve, 500));
  const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)];

  // Typewriter effect
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

const removeTag = (tag) => {
  form.tags = form.tags.filter((t) => t !== tag);
};

const handleCreate = () => {
  if (!isFormValid.value) return;

  // TODO: API call to create community
  console.log("Creating community:", form);

  // Navigate to the new community
  router.push(`/community/${form.slug}`);
};

const handleCancel = () => {
  router.back();
};
</script>
