<template>
  <div class="w-full sticky bottom-0 left-0 bg-background z-10 -mb-4 p-4 flex flex-col gap-2">
    <Textarea
      ref="textarea"
      v-model="text"
      placeholder="Type a message… Use @ to mention, # to tag workspace"
      class="min-h-28 resize-none"
      @input="onInput"
      @scroll="syncScroll"
      @keydown.down.prevent="next"
      @keydown.up.prevent="prev"
      @keydown.enter.prevent="select"
      @keydown.escape="closePanel"
      @keydown="onKeydown"
      @click="onCursorMove"
      @blur="onBlur"
    />

    <div class="ml-auto space-x-2">
      <Button variant="outline"> <ImagePlus /> </Button>
      <Button class="text-sm h-9"> <Send /> Send </Button>
    </div>

    <!-- User mention list -->
    <div
      v-if="open && mentionType === 'user'"
      ref="panelRef"
      class="absolute bottom-full left-2 z-50 mb-2 w-56 rounded-md border bg-popover shadow-md"
    >
      <div
        v-for="(user, i) in filteredUsers"
        :key="user.id"
        @mousedown.prevent="insertUser(user)"
        class="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
        :class="{ 'bg-accent': i === index }"
      >
        <img :src="user.avatar" class="h-6 w-6 rounded-full" />
        <span>{{ user.name }}</span>
      </div>
    </div>

    <!-- Workspace mention list -->
    <div
      v-if="open && mentionType === 'workspace'"
      ref="panelRef"
      class="absolute bottom-full left-2 z-50 mb-2 w-64 rounded-md border bg-popover shadow-md"
    >
      <div
        class="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b"
      >
        Workspaces
      </div>
      <div
        v-for="(ws, i) in filteredWorkspaces"
        :key="ws.id"
        @mousedown.prevent="insertWorkspace(ws)"
        class="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
        :class="{ 'bg-accent': i === index }"
      >
        <span class="text-base">{{ ws.emoji }}</span>
        <div class="flex flex-col min-w-0">
          <span class="truncate font-medium">{{ ws.name }}</span>
          <span v-if="ws.parentName" class="text-xs text-muted-foreground truncate">{{
            ws.parentName
          }}</span>
        </div>
      </div>
      <div
        v-if="filteredWorkspaces.length === 0"
        class="px-3 py-3 text-sm text-muted-foreground text-center"
      >
        No workspaces found
      </div>
    </div>
  </div>
</template>

<script setup>
import { Send, ImagePlus } from "lucide-vue-next";
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";

const textarea = ref(null);
const panelRef = ref(null);
const text = ref("");
const open = ref(false);
const query = ref("");
const index = ref(0);
const mentionType = ref("user"); // 'user' | 'workspace'

/* Dummy users */
const users = [
  { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
  { id: "u2", name: "Bob", avatar: "/images/avatar/2.png" },
  { id: "u3", name: "Charlie", avatar: "/images/avatar/3.png" },
  { id: "u4", name: "Daisy", avatar: "/images/avatar/4.png" }
];

/* Workspace pages (flattened from sidebar data) */
const workspacePages = [
  {
    id: "ws_1",
    name: "Daily Journal & Reflection",
    emoji: "📔",
    url: "/community/orion_group/workspaces/1",
    parentName: "Personal Life Management",
    description: "Track your daily thoughts, gratitude, and reflections."
  },
  {
    id: "ws_2",
    name: "Health & Wellness Tracker",
    emoji: "🍏",
    url: "/community/orion_group/workspaces/2",
    parentName: "Personal Life Management",
    description: "Monitor health goals, workouts, and nutrition."
  },
  {
    id: "ws_3",
    name: "Personal Growth & Learning Goals",
    emoji: "🌟",
    url: "/community/orion_group/workspaces/3",
    parentName: "Personal Life Management",
    description: "Set and track personal development milestones."
  },
  {
    id: "ws_4",
    name: "Career Objectives & Milestones",
    emoji: "🎯",
    url: "/community/orion_group/workspaces/4",
    parentName: "Professional Development",
    description: "Plan career goals and track progress."
  },
  {
    id: "ws_5",
    name: "Skill Acquisition & Training Log",
    emoji: "🧠",
    url: "/community/orion_group/workspaces/5",
    parentName: "Professional Development",
    description: "Log new skills learned and training completed."
  },
  {
    id: "ws_6",
    name: "Writing Ideas & Story Outlines",
    emoji: "✍️",
    url: "/community/orion_group/workspaces/6",
    parentName: "Creative Projects",
    description: "Brainstorm writing ideas and create story outlines."
  },
  {
    id: "ws_7",
    name: "Art & Design Portfolio",
    emoji: "🖼️",
    url: "/community/orion_group/workspaces/7",
    parentName: "Creative Projects",
    description: "Showcase and organize your design work."
  }
];

/* Filter users */
const filteredUsers = computed(() =>
  users.filter((u) => u.name.toLowerCase().startsWith(query.value.toLowerCase()))
);

/* Filter workspaces */
const filteredWorkspaces = computed(() =>
  workspacePages.filter((w) => w.name.toLowerCase().includes(query.value.toLowerCase()))
);

const currentList = computed(() =>
  mentionType.value === "user" ? filteredUsers.value : filteredWorkspaces.value
);

function onInput(e) {
  const cursor = e.target.selectionStart;
  const before = text.value.slice(0, cursor);

  // Check for # (workspace mention)
  const wsMatch = before.match(/#([\w\s]*)$/);
  if (wsMatch) {
    query.value = wsMatch[1].trim();
    mentionType.value = "workspace";
    open.value = true;
    index.value = 0;
    return;
  }

  // Check for @ (user mention)
  const userMatch = before.match(/@(\w*)$/);
  if (userMatch) {
    query.value = userMatch[1];
    mentionType.value = "user";
    open.value = true;
    index.value = 0;
    return;
  }

  open.value = false;
}

function insertUser(user) {
  const ta = textarea.value;
  const cursor = ta.selectionStart;
  const full = text.value;
  const atIndex = full.lastIndexOf("@", cursor - 1);

  if (atIndex !== -1) {
    let end = atIndex + 1;
    while (end < full.length && /[\w]/.test(full.charAt(end))) end++;

    const before = full.slice(0, atIndex);
    const after = full.slice(end);
    const inserted = `@${user.name} `;

    text.value = before + inserted + after;
    open.value = false;

    nextTick(() => {
      const pos = before.length + inserted.length;
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
    return;
  }

  text.value = full + ` @${user.name} `;
  open.value = false;
  nextTick(() => {
    ta.focus();
    const pos = text.value.length;
    ta.setSelectionRange(pos, pos);
  });
}

function insertWorkspace(ws) {
  const ta = textarea.value;
  const cursor = ta.selectionStart;
  const full = text.value;
  const hashIndex = full.lastIndexOf("#", cursor - 1);

  if (hashIndex !== -1) {
    // consume all chars after # until cursor (workspace names can have spaces)
    const before = full.slice(0, hashIndex);
    const after = full.slice(cursor);
    const inserted = `#[${ws.name}](${ws.id}) `;

    text.value = before + inserted + after;
    open.value = false;

    nextTick(() => {
      const pos = before.length + inserted.length;
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
    return;
  }

  text.value = full + ` #[${ws.name}](${ws.id}) `;
  open.value = false;
  nextTick(() => {
    ta.focus();
    const pos = text.value.length;
    ta.setSelectionRange(pos, pos);
  });
}

function next() {
  if (!open.value || currentList.value.length === 0) return;
  index.value = (index.value + 1) % currentList.value.length;
}

function prev() {
  if (!open.value || currentList.value.length === 0) return;
  index.value = (index.value - 1 + currentList.value.length) % currentList.value.length;
}

function select() {
  if (!open.value || currentList.value.length === 0) return;
  const item = currentList.value[index.value];
  if (mentionType.value === "user") {
    insertUser(item);
  } else {
    insertWorkspace(item);
  }
}

function syncScroll() {
  textarea.value.previousElementSibling.scrollTop = textarea.value.scrollTop;
}

function closePanel() {
  open.value = false;
}

function onBlur(e) {
  setTimeout(() => {
    if (!panelRef.value?.contains(document.activeElement)) {
      open.value = false;
    }
  }, 100);
}

function onCursorMove() {
  const ta = textarea.value;
  if (!ta) return;
  const cursor = ta.selectionStart;
  const before = text.value.slice(0, cursor);

  const wsMatch = before.match(/#([\w\s]*)$/);
  if (wsMatch) {
    query.value = wsMatch[1].trim();
    mentionType.value = "workspace";
    open.value = true;
    index.value = 0;
    return;
  }

  const userMatch = before.match(/@(\w*)$/);
  if (userMatch) {
    query.value = userMatch[1];
    mentionType.value = "user";
    open.value = true;
    index.value = 0;
    return;
  }

  open.value = false;
}

function onKeydown(e) {
  if (e.ctrlKey && e.code === "Space") {
    e.preventDefault();
    const ta = textarea.value;
    if (!ta) return;
    const cursor = ta.selectionStart;
    const before = text.value.slice(0, cursor);

    const wsMatch = before.match(/#([\w\s]*)$/);
    if (wsMatch) {
      query.value = wsMatch[1].trim();
      mentionType.value = "workspace";
      open.value = true;
      index.value = 0;
      return;
    }

    const userMatch = before.match(/@(\w*)$/);
    if (userMatch) {
      query.value = userMatch[1];
      mentionType.value = "user";
      open.value = true;
      index.value = 0;
    }
  }
}

function onClickOutside(e) {
  if (!open.value) return;
  const panel = panelRef.value;
  const ta = textarea.value;
  if (panel && !panel.contains(e.target) && ta && !ta.contains(e.target)) {
    open.value = false;
  }
}

onMounted(() => {
  document.addEventListener("mousedown", onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", onClickOutside);
});
</script>
