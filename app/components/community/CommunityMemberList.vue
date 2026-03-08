<template>
  <div class="rounded-2xl border border-border/50 bg-card/50">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 pt-5 pb-3">
      <h3 class="text-sm font-medium tracking-wider text-muted-foreground uppercase">Members</h3>
      <Button
        variant="ghost"
        size="sm"
        class="h-7 text-xs text-muted-foreground"
        @click="modalOpen = true"
      >
        View all
        <ArrowUpRight class="ml-1 size-3" />
      </Button>
    </div>

    <!-- Role filter pills -->
    <div class="flex flex-wrap gap-1.5 px-5 pb-3">
      <button
        v-for="role in allRoles"
        :key="role.id"
        class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors"
        :class="
          selectedRole === role.id
            ? 'border-primary/50 bg-primary/10 text-primary'
            : 'border-border/50 bg-muted/20 text-muted-foreground hover:border-border hover:text-foreground'
        "
        @click="selectedRole = role.id"
      >
        <span
          class="size-1.5 rounded-full"
          :style="role.color ? `background:${role.color}` : ''"
          :class="!role.color ? role.dotColor : ''"
        />
        {{ role.label }}
        <span class="tabular-nums opacity-70">{{ role.count }}</span>
      </button>
    </div>

    <!-- Member list (max 10) -->
    <div class="space-y-0.5 px-3 pb-4">
      <div v-if="!pagedMembers.length" class="py-6 text-center text-xs text-muted-foreground">
        No members in this role.
      </div>
      <button
        v-for="member in pagedMembers"
        :key="member.id"
        class="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/30"
        @click="$emit('selectMember', member)"
      >
        <div class="relative shrink-0">
          <Avatar class="size-8">
            <AvatarImage :src="member.avatar" />
            <AvatarFallback class="text-xs">{{ member.name.charAt(0) }}</AvatarFallback>
          </Avatar>
          <span
            v-if="member.online"
            class="absolute right-0 bottom-0 size-2.5 rounded-full bg-green-500 ring-2 ring-card"
          />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5">
            <span class="truncate text-sm font-medium">{{ member.name }}</span>
            <Crown
              v-if="props.ownerId && member.id === props.ownerId"
              class="size-3 shrink-0 text-yellow-500"
            />
            <Wrench
              v-else-if="member.role?.toLowerCase() === 'mod'"
              class="size-3 shrink-0 text-blue-500"
            />
          </div>
          <p class="truncate text-xs text-muted-foreground">
            {{ member.status || displayRole(member.id, member.role) }}
          </p>
        </div>
        <span
          v-if="props.ownerId && member.id === props.ownerId"
          class="shrink-0 rounded-md border border-yellow-500/40 bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-medium text-yellow-500"
        >
          Owner
        </span>
      </button>
    </div>

    <!-- Footer: +N more -->
    <div
      v-if="filteredMembers.length > 10"
      class="border-t border-border/40 px-5 py-2.5 text-center"
    >
      <button
        class="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        @click="modalOpen = true"
      >
        +{{ filteredMembers.length - 10 }} more — view all
      </button>
    </div>
  </div>

  <!-- ── All Members Modal ──────────────────────────────────────────────────── -->
  <Dialog v-model:open="modalOpen">
    <DialogContent class="flex max-h-[80vh] max-w-lg flex-col gap-0 overflow-hidden p-0">
      <!-- Modal header -->
      <div class="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <DialogTitle class="text-sm font-semibold">All Members</DialogTitle>
          <p class="text-xs text-muted-foreground">{{ members.length }} total</p>
        </div>
        <!-- Role filter pills in modal -->
        <div class="flex flex-wrap justify-end gap-1">
          <button
            v-for="role in allRoles"
            :key="role.id"
            class="rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors"
            :class="
              modalRole === role.id
                ? 'border-primary/50 bg-primary/10 text-primary'
                : 'border-border/50 text-muted-foreground hover:text-foreground'
            "
            @click="modalRole = role.id"
          >
            {{ role.label }}
          </button>
        </div>
      </div>

      <!-- Full list -->
      <ScrollArea class="flex-1 overflow-y-auto">
        <div class="divide-y divide-border/40">
          <div
            v-if="!modalFilteredMembers.length"
            class="py-12 text-center text-sm text-muted-foreground"
          >
            No members in this role.
          </div>
          <button
            v-for="member in modalFilteredMembers"
            :key="member.id"
            class="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/20"
            @click="
              $emit('selectMember', member);
              modalOpen = false;
            "
          >
            <div class="relative shrink-0">
              <Avatar class="size-9">
                <AvatarImage :src="member.avatar" />
                <AvatarFallback class="text-sm">{{ member.name.charAt(0) }}</AvatarFallback>
              </Avatar>
              <span
                v-if="member.online"
                class="absolute right-0 bottom-0 size-2.5 rounded-full bg-green-500 ring-2 ring-background"
              />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span class="truncate text-sm font-medium">{{ member.name }}</span>
                <Crown
                  v-if="props.ownerId && member.id === props.ownerId"
                  class="size-3 shrink-0 text-yellow-500"
                />
                <Wrench
                  v-else-if="member.role?.toLowerCase() === 'mod'"
                  class="size-3 shrink-0 text-blue-500"
                />
              </div>
              <p class="truncate text-xs text-muted-foreground">
                {{ member.status || displayRole(member.id, member.role) }}
              </p>
            </div>
            <span
              v-if="props.ownerId && member.id === props.ownerId"
              class="shrink-0 rounded-md border border-yellow-500/40 bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-medium text-yellow-500"
            >
              Owner
            </span>
          </button>
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Crown, Wrench, ArrowUpRight } from "lucide-vue-next";

interface Member {
  id: string | number;
  name: string;
  avatar: string;
  role: string;
  status: string;
  online: boolean;
}

interface Role {
  id: string;
  label: string;
  count: number;
  dotColor: string;
  color?: string | null;
}

const props = defineProps<{
  members: Member[];
  roles?: Role[];
  ownerId?: string;
}>();

defineEmits<{
  selectMember: [member: Member];
}>();

// ─── State ────────────────────────────────────────────────────────────────────

const selectedRole = ref("all");
const modalRole = ref("all");
const modalOpen = ref(false);

watch(modalOpen, (open) => {
  if (open) modalRole.value = selectedRole.value;
});

// ─── Roles (use prop or derive from members) ──────────────────────────────────

const allRoles = computed<Role[]>(() => {
  if (props.roles?.length) return props.roles;
  const unique = [...new Set(props.members.map((m) => m.role))];
  return [
    { id: "all", label: "All", count: props.members.length, dotColor: "bg-muted-foreground" },
    ...unique.map((r) => ({
      id: r,
      label: r.charAt(0).toUpperCase() + r.slice(1),
      count: props.members.filter((m) => m.role === r).length,
      dotColor: "bg-muted-foreground",
      color: null
    }))
  ];
});

// ─── Filtered lists ───────────────────────────────────────────────────────────

const filterByRole = (list: Member[], roleId: string) =>
  roleId === "all"
    ? list
    : list.filter((m) => {
        const roleLabel = allRoles.value.find((r) => r.id === roleId)?.label.toLowerCase();
        return m.role.toLowerCase() === roleLabel;
      });

const filteredMembers = computed(() => filterByRole(props.members, selectedRole.value));
const pagedMembers = computed(() => filteredMembers.value.slice(0, 10));
const modalFilteredMembers = computed(() => filterByRole(props.members, modalRole.value));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function displayRole(memberId: string | number, role: string) {
  if (props.ownerId && memberId === props.ownerId) return "Owner";
  if (!role) return "Member";
  return role.charAt(0).toUpperCase() + role.slice(1);
}
</script>
