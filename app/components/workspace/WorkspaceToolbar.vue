<template>
  <div class="fixed top-4 left-1/2 z-40 -translate-x-1/2">
    <div
      class="flex items-center gap-2 rounded-xl border border-border/60 bg-card/95 px-3 py-2 shadow-lg backdrop-blur-xl"
    >
      <!-- Back -->
      <Button variant="ghost" size="icon" class="size-8" @click="$router.back()">
        <ArrowLeft class="size-4" />
      </Button>

      <!-- Workspace name -->
      <span class="max-w-40 truncate text-sm font-medium">{{ workspaceName }}</span>

      <Separator orientation="vertical" class="h-5" />

      <!-- Add Node (persona picker) -->
      <Popover v-model:open="popoverOpen">
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" class="gap-1.5">
            <Plus class="size-4" /> Add Persona
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-72 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search personas..." />
            <CommandEmpty>No personas found.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  v-for="persona in personas"
                  :key="persona.id"
                  :value="persona.id + ' ' + persona.name + ' ' + persona.description"
                  @select="selectPersona(persona)"
                >
                  <span class="mr-2 text-base">{{ persona.emoji }}</span>
                  <div class="min-w-0 flex-1">
                    <span class="text-sm font-medium">{{ persona.name }}</span>
                    <p class="truncate text-xs text-muted-foreground">{{ persona.description }}</p>
                  </div>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <!-- Select All -->
      <Button variant="ghost" size="sm" @click="$emit('selectAll')">Select All</Button>

      <Separator orientation="vertical" class="h-5" />

      <!-- AI Toggle -->
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div class="flex items-center gap-1.5">
              <Switch :checked="aiEnabled" class="scale-75" @update:checked="$emit('toggle-ai')" />
              <span
                class="text-xs"
                :class="aiEnabled ? 'text-emerald-500' : 'text-muted-foreground/50'"
              >
                AI
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p class="text-xs">
              {{
                aiEnabled ? "AI enabled — prompts will call Ollama" : "AI disabled — no API calls"
              }}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Separator orientation="vertical" class="h-5" />

      <!-- Memory -->
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" class="size-8" @click="$emit('openMemory')">
              <Brain class="size-4" />
              <span
                v-if="memoryCount > 0"
                class="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground"
              >
                {{ memoryCount }}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p class="text-xs">Workspace memory ({{ memoryCount }})</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <!-- History -->
      <Button variant="ghost" size="icon" class="size-8" @click="$emit('openHistory')">
        <History class="size-4" />
      </Button>

      <!-- Members -->
      <TooltipProvider v-if="members.length">
        <div class="flex items-center -space-x-1.5">
          <Tooltip v-for="member in displayedMembers" :key="member.id">
            <TooltipTrigger>
              <Avatar class="size-6 ring-2 ring-card transition-all hover:z-10 hover:ring-primary">
                <AvatarImage :src="member.avatar_url || ''" />
                <AvatarFallback class="text-[10px]">{{
                  member.username.slice(0, 2).toUpperCase()
                }}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p class="text-xs">{{ member.username }}</p>
            </TooltipContent>
          </Tooltip>
          <div
            v-if="members.length > 4"
            class="z-5 flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium ring-2 ring-card"
          >
            +{{ members.length - 4 }}
          </div>
        </div>
      </TooltipProvider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Plus, History, Brain } from "lucide-vue-next";

interface Persona {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

interface Member {
  id: string;
  username: string;
  avatar_url: string | null;
}

const props = defineProps<{
  workspaceName: string;
  personas: Persona[];
  members: Member[];
  aiEnabled: boolean;
  memoryCount: number;
}>();

const emit = defineEmits<{
  addNode: [persona: Persona];
  selectAll: [];
  openHistory: [];
  openMemory: [];
  "toggle-ai": [];
}>();

const popoverOpen = ref(false);
const displayedMembers = computed(() => props.members.slice(0, 4));

function selectPersona(persona: Persona) {
  emit("addNode", persona);
  popoverOpen.value = false;
}
</script>
