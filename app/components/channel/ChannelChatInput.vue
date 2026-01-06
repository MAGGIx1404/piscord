<template>
  <div class="w-full sticky bottom-0 left-0 bg-background z-10 -mb-4 p-4 flex flex-col gap-2">
    <Textarea
      ref="textarea"
      v-model="text"
      placeholder="Type a message… Use @ to mention"
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

    <!-- User list -->
    <div
      v-if="open"
      ref="panelRef"
      class="absolute bottom-full left-2 z-50 mb-2 w-56 rounded-md border bg-popover shadow-md"
    >
      <div
        v-for="(user, i) in filteredUsers"
        :key="user.id"
        @mousedown.prevent="insert(user)"
        class="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
        :class="{ 'bg-accent': i === index }"
      >
        <img :src="user.avatar" class="h-6 w-6 rounded-full" />
        <span>{{ user.name }}</span>
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

/* Dummy users (replace with real users) */
const users = [
  { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
  { id: "u2", name: "Bob", avatar: "/images/avatar/2.png" },
  { id: "u3", name: "Charlie", avatar: "/images/avatar/3.png" },
  { id: "u4", name: "Daisy", avatar: "/images/avatar/4.png" }
];

/* Filter users */
const filteredUsers = computed(() =>
  users.filter((u) => u.name.toLowerCase().startsWith(query.value.toLowerCase()))
);

function onInput(e) {
  const cursor = e.target.selectionStart;
  const before = text.value.slice(0, cursor);
  const match = before.match(/@(\w*)$/);

  if (match) {
    query.value = match[1];
    open.value = true;
    index.value = 0;
  } else {
    open.value = false;
  }
}

function insert(user) {
  const ta = textarea.value;
  const cursor = ta.selectionStart;

  // find the nearest '@' before the cursor and replace the whole token
  const full = text.value;
  const atIndex = full.lastIndexOf("@", cursor - 1);

  if (atIndex !== -1) {
    // consume word characters after the @ to remove partial token
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

function next() {
  if (!open.value) return;
  index.value = (index.value + 1) % filteredUsers.value.length;
}

function prev() {
  if (!open.value) return;
  index.value = (index.value - 1 + filteredUsers.value.length) % filteredUsers.value.length;
}

function select() {
  if (!open.value) return;
  insert(filteredUsers.value[index.value]);
}

function syncScroll() {
  textarea.value.previousElementSibling.scrollTop = textarea.value.scrollTop;
}

function closePanel() {
  open.value = false;
}

function onBlur(e) {
  // Delay to allow mousedown on panel items to fire first
  setTimeout(() => {
    if (!panelRef.value?.contains(document.activeElement)) {
      open.value = false;
    }
  }, 100);
}

function onCursorMove() {
  // Check if cursor is still in a mention token
  const ta = textarea.value;
  if (!ta) return;
  const cursor = ta.selectionStart;
  const before = text.value.slice(0, cursor);
  const match = before.match(/@(\w*)$/);
  if (!match) {
    open.value = false;
  }
}

function onKeydown(e) {
  // Ctrl+Space to reopen suggestions if cursor is at a mention token
  if (e.ctrlKey && e.code === "Space") {
    e.preventDefault();
    const ta = textarea.value;
    if (!ta) return;
    const cursor = ta.selectionStart;
    const before = text.value.slice(0, cursor);
    const match = before.match(/@(\w*)$/);
    if (match) {
      query.value = match[1];
      open.value = true;
      index.value = 0;
    }
  }
}

// Click outside detection
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
