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

      <!-- Add Node (searchable popover) -->
      <Popover v-model:open="open">
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" class="gap-1.5">
            <Plus class="size-4" /> Add Node
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search models..." />
            <CommandEmpty>No models found.</CommandEmpty>
            <CommandList>
              <CommandGroup
                v-for="group in groupedModels"
                :key="group.provider"
                :heading="group.provider"
              >
                <CommandItem
                  v-for="model in group.models"
                  :key="model.id"
                  :value="model.id + ' ' + model.name + ' ' + model.provider"
                  @select="selectModel(model)"
                >
                  <span class="truncate text-sm">{{ model.name }}</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <!-- Select All -->
      <Button variant="ghost" size="sm" @click="$emit('selectAll')"> Select All </Button>

      <Separator orientation="vertical" class="h-5" />

      <!-- History -->
      <Button variant="ghost" size="icon" class="size-8" @click="$emit('openHistory')">
        <History class="size-4" />
      </Button>

      <!-- Members -->
      <TooltipProvider v-if="members.length">
        <div class="flex items-center -space-x-1.5">
          <Tooltip v-for="member in displayedMembers" :key="member.id">
            <TooltipTrigger>
              <Avatar class="size-6 ring-2 ring-card transition-all hover:ring-primary hover:z-10">
                <AvatarImage :src="member.avatar_url" />
                <AvatarFallback class="text-[10px]">{{ getInitials(member.username) }}</AvatarFallback>
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
import { ArrowLeft, Plus, History } from "lucide-vue-next";

interface AIModel {
  id: string;
  name: string;
  provider: string;
}

interface Member {
  id: string;
  username: string;
  avatar_url: string | null;
}

const props = defineProps<{
  workspaceName: string;
  models: AIModel[];
  members: Member[];
}>();

const emit = defineEmits<{
  addNode: [model: AIModel];
  selectAll: [];
  openHistory: [];
}>();

const displayedMembers = computed(() => props.members.slice(0, 4));

function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

const open = ref(false);

const groupedModels = computed(() => {
  const groups = new Map<string, AIModel[]>();
  for (const model of props.models) {
    const p = model.provider;
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p)!.push(model);
  }
  return Array.from(groups.entries()).map(([provider, models]) => ({ provider, models }));
});

function selectModel(model: AIModel) {
  emit("addNode", model);
  open.value = false;
}
</script>
