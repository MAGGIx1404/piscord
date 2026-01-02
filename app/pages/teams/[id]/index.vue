<template><main class="w-full h-full rounded-md p-4"></main></template>

<script setup>
import { ref } from "vue";

const team = {
  id: "orion_group",
  name: "Orion Group",
  longDescription:
    "Orion Group is a community-driven platform focused on fostering collaboration and innovation among its members. We host channels for discussions, multiple workspaces for projects, and a growing member base."
};

const channels = ref([
  { id: "c1", name: "general", topic: "General discussion", members: 124 },
  { id: "c2", name: "dev", topic: "Development & PRs", members: 62 },
  { id: "c3", name: "design", topic: "UI/UX", members: 18 }
]);

const workspaces = ref([
  { id: "w1", name: "Website", desc: "Main website and marketing", icon: "W" },
  { id: "w2", name: "Mobile App", desc: "iOS & Android clients", icon: "M" }
]);

const members = ref([
  { id: "u1", name: "Alice", image: "/images/avatar/1.png", role: "Owner", status: "online" },
  { id: "u2", name: "Jeet", image: "/images/avatar/2.png", role: "Developer", status: "away" },
  { id: "u3", name: "Ryan", image: "/images/avatar/3.png", role: "Designer", status: "online" },
  { id: "u4", name: "Sam", image: "/images/avatar/4.png", role: "QA", status: "offline" },
  { id: "u5", name: "Taylor", image: "/images/avatar/5.png", role: "PM", status: "online" },
  { id: "u6", name: "Jordan", image: "/images/avatar/6.png", role: "DevOps", status: "offline" },
  { id: "u7", name: "Casey", image: "/images/avatar/7.png", role: "Support", status: "online" }
]);
</script>
