<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">Set the ground rules</h2>
      <p class="text-muted-foreground">
        Clear guidelines help maintain a positive environment for everyone.
      </p>
    </div>

    <!-- Add Rule -->
    <div class="flex gap-2">
      <Input
        v-model="ruleInput"
        placeholder="e.g., Be respectful to all members"
        class="h-12"
        @keydown.enter.prevent="addRule"
        :disabled="rules.length >= 10"
      />
      <Button
        class="h-12 px-4"
        @click="addRule"
        :disabled="!ruleInput.trim() || rules.length >= 10"
      >
        <Plus class="size-4" />
        Add
      </Button>
    </div>

    <!-- Rules List -->
    <div v-if="rules.length > 0" class="space-y-2">
      <TransitionGroup name="rule">
        <div
          v-for="(rule, index) in rules"
          :key="rule.id"
          class="group flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all"
        >
          <div
            class="size-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary"
          >
            {{ index + 1 }}
          </div>
          <p class="flex-1 text-sm">{{ rule.text }}</p>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              class="size-8"
              @click="moveRule(index, -1)"
              :disabled="index === 0"
            >
              <ChevronUp class="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="size-8"
              @click="moveRule(index, 1)"
              :disabled="index === rules.length - 1"
            >
              <ChevronDown class="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              @click="removeRule(rule.id)"
            >
              <Trash2 class="size-4" />
            </Button>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-2xl bg-card/30"
    >
      <div class="size-14 rounded-full bg-muted flex items-center justify-center mb-4">
        <ScrollText class="size-7 text-muted-foreground" />
      </div>
      <p class="font-medium">No rules yet</p>
      <p class="text-sm text-muted-foreground mt-1">
        Add rules above or use quick suggestions below
      </p>
    </div>

    <!-- Quick Suggestions -->
    <div v-if="rules.length < 10 && availableSuggestions.length > 0" class="space-y-3">
      <Label class="text-xs uppercase tracking-wider text-muted-foreground">Quick Add</Label>
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="suggestion in availableSuggestions"
          :key="suggestion"
          variant="outline"
          size="sm"
          class="h-8"
          @click="addSuggestedRule(suggestion)"
        >
          <Plus class="size-3 mr-1" />
          {{ suggestion }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, ChevronUp, ChevronDown, Trash2, ScrollText } from "lucide-vue-next";

interface Rule {
  id: number;
  text: string;
}

const props = defineProps<{
  rules: Rule[];
}>();

const emit = defineEmits<{
  "update:rules": [value: Rule[]];
}>();

const ruleInput = ref("");

const ruleSuggestions = [
  "Be respectful to all members",
  "No spam or self-promotion",
  "No hate speech or harassment",
  "Keep discussions on topic",
  "No NSFW content"
];

const availableSuggestions = computed(() => {
  return ruleSuggestions.filter((s) => !props.rules.some((r) => r.text === s));
});

const addRule = () => {
  const text = ruleInput.value.trim();
  if (text && props.rules.length < 10 && !props.rules.some((r) => r.text === text)) {
    emit("update:rules", [...props.rules, { id: Date.now(), text }]);
    ruleInput.value = "";
  }
};

const addSuggestedRule = (text: string) => {
  if (props.rules.length < 10 && !props.rules.some((r) => r.text === text)) {
    emit("update:rules", [...props.rules, { id: Date.now(), text }]);
  }
};

const removeRule = (id: number) => {
  emit(
    "update:rules",
    props.rules.filter((r) => r.id !== id)
  );
};

const moveRule = (index: number, direction: number) => {
  const newIndex = index + direction;
  if (newIndex >= 0 && newIndex < props.rules.length) {
    const newRules = [...props.rules];
    const temp = newRules[index];
    const swapItem = newRules[newIndex];
    if (temp && swapItem) {
      newRules[index] = swapItem;
      newRules[newIndex] = temp;
      emit("update:rules", newRules);
    }
  }
};
</script>

<style scoped>
.rule-enter-active,
.rule-leave-active {
  transition: all 0.3s ease;
}
.rule-enter-from,
.rule-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
