<template>
  <Dialog v-model:open="model">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Create Channel</DialogTitle>
        <DialogDescription>Add a new channel to this community.</DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-4 py-2">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Name</label>
          <Input v-model="form.name" placeholder="general" maxlength="100" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Type</label>
          <Select v-model="form.type">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="voice">Voice</SelectItem>
              <SelectItem value="announcement">Announcement</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div v-if="form.type !== 'category'" class="flex flex-col gap-2">
          <label class="text-sm font-medium">
            Topic <span class="text-muted-foreground">(optional)</span>
          </label>
          <Input v-model="form.topic" placeholder="What's this channel about?" />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="model = false">Cancel</Button>
        <Button :disabled="!form.name.trim() || creating" @click="handleCreate">
          <span
            v-if="creating"
            class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          <template v-else>Create</template>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { toast } from "vue-sonner";

const props = defineProps<{
  communityId: string;
  defaultType?: string;
}>();

const emit = defineEmits<{
  created: [];
}>();

const model = defineModel<boolean>({ required: true });

const api = useApi();
const creating = ref(false);

const form = reactive({
  name: "",
  type: props.defaultType ?? "text",
  topic: ""
});

watch(
  () => props.defaultType,
  (val) => {
    if (val) form.type = val;
  }
);

watch(model, (open) => {
  if (open) {
    form.name = "";
    form.type = props.defaultType ?? "text";
    form.topic = "";
  }
});

async function handleCreate() {
  if (!form.name.trim()) return;
  creating.value = true;
  try {
    await api(`/api/communities/${props.communityId}/channels`, {
      method: "POST",
      body: {
        name: form.name.trim(),
        type: form.type,
        topic: form.topic.trim() || undefined
      }
    });
    toast.success("Channel created!");
    model.value = false;
    emit("created");
  } catch (err: any) {
    toast.error(err?.data?.message ?? "Failed to create channel");
  } finally {
    creating.value = false;
  }
}
</script>
