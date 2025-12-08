<template>
  <div class="w-full space-y-6">
    <div class="w-full flex items-center gap-2">
      <Input
        type="text"
        id="server-search"
        name="server-search"
        :placeholder="myServers ? 'Search My Servers...' : 'Discover Servers...'"
      />

      <Button variant="secondary">
        <SlidersHorizontal />
        Reset
      </Button>
      <Button>
        <Search />
        Find Servers
      </Button>
    </div>

    <div class="w-full flex flex-wrap gap-2">
      <Badge
        v-for="(item, index) in history"
        :key="index"
        as-child
        :variant="historyVariants[index % historyVariants.length]"
      >
        <button>
          {{ item }}
        </button>
      </Badge>
      <Badge as-child variant="destructive">
        <button>
          <Eraser />
          Clear History
        </button>
      </Badge>
    </div>

    <Separator />
  </div>
</template>

<script setup>
import { Search, SlidersHorizontal, Eraser } from "lucide-vue-next";

const props = defineProps({
  myServers: {
    type: Boolean,
    default: false
  }
});

const history = ref([
  "Gaming Servers",
  "Study Groups",
  "Music Communities",
  "Tech Discussions",
  "Art and Creativity",
  "Book Clubs"
]);

const historyVariants = ["default", "secondary", "outline"];
</script>
