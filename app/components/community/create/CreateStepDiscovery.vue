<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">Help people find you</h2>
      <p class="text-muted-foreground">
        Choose a category and add tags so people can discover your community.
      </p>
    </div>

    <!-- Category Grid -->
    <div class="space-y-3">
      <Label class="text-xs uppercase tracking-wider text-muted-foreground">
        Category <span class="text-destructive">*</span>
      </Label>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          v-for="cat in categories"
          :key="cat.value"
          @click="$emit('update:category', cat.value)"
          class="relative p-4 rounded-xl border-2 transition-all duration-300 text-left group"
          :class="[
            category === cat.value
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50 hover:bg-card/50'
          ]"
        >
          <div
            class="size-10 rounded-xl flex items-center justify-center mb-3 transition-colors"
            :class="
              category === cat.value
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground group-hover:text-foreground'
            "
          >
            <component :is="cat.icon" class="size-5" />
          </div>
          <span class="font-medium text-sm">{{ cat.label }}</span>
          <div
            v-if="category === cat.value"
            class="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center"
          >
            <Check class="size-3 text-primary-foreground" />
          </div>
        </button>
      </div>
    </div>

    <!-- Tags -->
    <div class="space-y-3">
      <Label class="text-xs uppercase tracking-wider text-muted-foreground">
        Tags <span class="text-muted-foreground font-normal">(up to 5)</span>
      </Label>
      <div class="flex gap-2">
        <Input
          v-model="tagInput"
          placeholder="Type a tag and press Enter..."
          class="h-12"
          @keydown.enter.prevent="addTag"
          :disabled="tags.length >= 5"
        />
        <Button
          variant="outline"
          class="h-12 px-4"
          @click="addTag"
          :disabled="!tagInput.trim() || tags.length >= 5"
        >
          <Plus class="size-4" />
        </Button>
      </div>
      <div v-if="tags.length > 0" class="flex flex-wrap gap-2">
        <Badge
          v-for="tag in tags"
          :key="tag"
          variant="secondary"
          class="px-3 py-1.5 text-sm cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
          @click="removeTag(tag)"
        >
          {{ tag }}
          <X class="size-3" />
        </Badge>
      </div>
      <p class="text-xs text-muted-foreground">
        Tags help people find your community. Click a tag to remove it.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Gamepad2,
  Code,
  Music,
  Palette,
  BookOpen,
  Briefcase,
  Film,
  Heart,
  Plus,
  X,
  Check
} from "lucide-vue-next";

const props = defineProps<{
  category: string;
  tags: string[];
}>();

const emit = defineEmits<{
  "update:category": [value: string];
  "update:tags": [value: string[]];
}>();

const tagInput = ref("");

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

const addTag = () => {
  const tag = tagInput.value.trim().toLowerCase();
  if (tag && !props.tags.includes(tag) && props.tags.length < 5) {
    emit("update:tags", [...props.tags, tag]);
    tagInput.value = "";
  }
};

const removeTag = (tag: string) => {
  emit(
    "update:tags",
    props.tags.filter((t) => t !== tag)
  );
};
</script>
