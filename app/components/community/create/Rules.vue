<template>
  <Card class="p-6">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Gavel class="size-5" />
        Community Rules
      </CardTitle>
      <CardDescription>
        Set clear guidelines for your community members to follow.
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <!-- Add Rule Input -->
      <div class="space-y-2">
        <ButtonGroup class="gap-0! w-full">
          <InputGroup class="h-full">
            <InputGroupInput
              :model-value="ruleInput"
              @update:model-value="$emit('update:ruleInput', $event)"
              placeholder="Enter a rule (e.g., Be respectful to all members)"
              @keydown.enter.prevent="$emit('addRule')"
              :disabled="rules.length >= 10"
            />
          </InputGroup>
          <ButtonGroupText
            @click="$emit('addRule')"
            :disabled="!ruleInput.trim() || rules.length >= 10"
          >
            <Plus class="size-4" />
          </ButtonGroupText>
        </ButtonGroup>
        <p class="text-xs text-muted-foreground">Add up to 10 rules. Press Enter to add.</p>
      </div>

      <!-- Rules List -->
      <div v-if="rules.length > 0" class="space-y-2">
        <TransitionGroup name="rule">
          <div
            v-for="(rule, index) in rules"
            :key="rule.id"
            class="group flex items-center gap-3 p-3 rounded-lg border border-input bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div
              class="size-6 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary"
            >
              {{ index + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm wrap-break-word">{{ rule.text }}</p>
            </div>
            <div
              class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Button
                variant="ghost"
                size="icon"
                class="size-7"
                @click="$emit('moveRule', index, -1)"
                :disabled="index === 0"
              >
                <ChevronUp class="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="size-7"
                @click="$emit('moveRule', index, 1)"
                :disabled="index === rules.length - 1"
              >
                <ChevronDown class="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                @click="$emit('removeRule', rule.id)"
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
        class="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-input rounded-xl"
      >
        <div class="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <ScrollText class="size-6 text-muted-foreground" />
        </div>
        <p class="text-sm font-medium">No rules added yet</p>
        <p class="text-xs text-muted-foreground mt-1">
          Add rules to help maintain a positive community environment.
        </p>
      </div>

      <!-- Quick Add Suggestions -->
      <div v-if="rules.length < 10" class="space-y-2">
        <Label class="text-xs text-muted-foreground">Quick add suggestions:</Label>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="suggestion in availableSuggestions"
            :key="suggestion"
            variant="outline"
            size="sm"
            class="h-7 text-xs"
            @click="$emit('addSuggestedRule', suggestion)"
          >
            <Plus class="size-3 mr-1" />
            {{ suggestion }}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Gavel, Plus, ChevronUp, ChevronDown, Trash2, ScrollText } from "lucide-vue-next";
import { computed } from "vue";

interface Rule {
  id: number;
  text: string;
}

interface Props {
  rules: Rule[];
  ruleInput: string;
  suggestions: string[];
}

const props = defineProps<Props>();

defineEmits<{
  "update:ruleInput": [value: string];
  addRule: [];
  removeRule: [id: number];
  moveRule: [index: number, direction: number];
  addSuggestedRule: [text: string];
}>();

const availableSuggestions = computed(() => {
  return props.suggestions.filter((s) => !props.rules.some((r) => r.text === s));
});
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
