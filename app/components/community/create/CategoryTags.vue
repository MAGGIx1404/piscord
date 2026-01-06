<template>
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
        <Select
          :model-value="category"
          @update:model-value="$emit('update:category', String($event))"
        >
          <SelectTrigger class="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="cat in categories" :key="cat.value" :value="cat.value">
              <div class="flex items-center gap-2">
                <component :is="cat.icon" class="size-4" />
                {{ cat.label }}
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
              :model-value="tagInput"
              @update:model-value="$emit('update:tagInput', $event)"
              placeholder="Add a tag..."
              @keydown.enter.prevent="$emit('addTag')"
              :disabled="tags.length >= 5"
            />
          </InputGroup>
          <ButtonGroupText
            @click="$emit('addTag')"
            :disabled="!tagInput.trim() || tags.length >= 5"
          >
            <Plus class="size-4" />
          </ButtonGroupText>
        </ButtonGroup>

        <div v-if="tags.length !== 0" class="flex flex-wrap gap-2 mb-2">
          <Badge
            v-for="tag in tags"
            :key="tag"
            class="cursor-pointer"
            @click="$emit('removeTag', tag)"
          >
            {{ tag }}
            <X class="size-3" />
          </Badge>
        </div>

        <p class="text-xs text-muted-foreground">Add up to 5 tags. Press Enter to add.</p>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Tag, Plus, X } from "lucide-vue-next";
import type { Component } from "vue";

interface Category {
  value: string;
  label: string;
  icon: Component;
}

interface Props {
  category: string;
  tags: string[];
  tagInput: string;
  categories: Category[];
}

defineProps<Props>();

defineEmits<{
  "update:category": [value: string];
  "update:tagInput": [value: string];
  addTag: [];
  removeTag: [tag: string];
}>();
</script>
