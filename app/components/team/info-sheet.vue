<template>
  <Sheet>
    <SheetTrigger as-child>
      <Button variant="ghost" class="rounded-md size-8"> <TextAlignJustify /> </Button>
    </SheetTrigger>
    <SheetContent class="sm:max-w-lg overflow-y-auto gap-2">
      <SheetHeader class="text-left space-y-4">
        <WidgetsImagePoster src="/images/servers/poster.jpg" size="md" />
        <div class="space-y-2">
          <SheetTitle class="text-xl flex items-center gap-2">
            <Hash class="size-5 text-muted-foreground" />
            {{ channel.name }}
          </SheetTitle>
          <SheetDescription>{{ channel.description }}</SheetDescription>
        </div>
      </SheetHeader>

      <!-- Content -->
      <div class="w-full px-4 space-y-6">
        <Separator />

        <!-- Channel Info -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium flex items-center gap-2">
            <Info class="size-4" /> Channel Info
          </h4>
          <div class="text-sm space-y-2 text-muted-foreground">
            <div class="flex justify-between">
              <span>Created</span>
              <Badge>{{ channel.createdAt }}</Badge>
            </div>
            <div class="flex justify-between">
              <span>Category</span>
              <Badge>{{ channel.category }}</Badge>
            </div>
            <div class="flex justify-between">
              <span>Type</span>
              <Badge>{{ channel.type }}</Badge>
            </div>
          </div>
        </div>

        <Separator />

        <!-- Members Preview -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium flex items-center gap-2">
            <Users class="size-4" /> Members
          </h4>
          <div class="flex flex-wrap gap-2">
            <Badge
              v-for="member in members.slice(0, 8)"
              :key="member.id"
              class="rounded-md px-2 py-1"
              variant="outline"
            >
              <Avatar class="size-6">
                <AvatarImage :src="member.avatar" :alt="member.name" />
                <AvatarFallback>{{ member.name.charAt(0) }}</AvatarFallback>
              </Avatar>
              <span class="text-xs">{{ member.name }}</span>
            </Badge>
            <Badge variant="secondary" v-if="members.length > 8" class="px-2 py-1 rounded-md">
              +{{ members.length - 8 }} more
            </Badge>
          </div>
        </div>

        <Separator />

        <!-- Media Library -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium flex items-center gap-2">
            <ImageIcon class="size-4" /> Media Library
          </h4>
          <div class="grid grid-cols-3 gap-2">
            <div
              v-for="(asset, i) in mediaAssets.slice(0, 9)"
              :key="i"
              class="aspect-square rounded-md overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img :src="asset" alt="Media" class="w-full h-full object-cover" />
            </div>
          </div>
          <Button v-if="mediaAssets.length > 9" variant="ghost" class="w-full text-xs">
            View all {{ mediaAssets.length }} media
          </Button>
        </div>
      </div>

      <SheetFooter class="flex-row gap-2 mt-auto">
        <Button variant="outline" class="flex-1"> <BellOff /> Mute </Button>
        <Button class="flex-1"> <Settings /> Settings </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { ref } from "vue";
import {
  TextAlignJustify,
  Hash,
  Info,
  Users,
  Image as ImageIcon,
  BellOff,
  Settings
} from "lucide-vue-next";

const channel = ref({
  name: "General",
  description: "General discussion and announcements for the team.",
  totalMembers: 124,
  totalMessages: 3847,
  createdAt: "Dec 15, 2024",
  category: "Text Channels",
  type: "Public"
});

const members = ref([
  { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
  { id: "u2", name: "Bob", avatar: "/images/avatar/2.png" },
  { id: "u3", name: "Charlie", avatar: "/images/avatar/3.png" },
  { id: "u4", name: "Daisy", avatar: "/images/avatar/4.png" },
  { id: "u5", name: "Edward", avatar: "/images/avatar/5.png" },
  { id: "u6", name: "Fiona", avatar: "/images/avatar/6.png" },
  { id: "u7", name: "George", avatar: "/images/avatar/7.png" },
  { id: "u8", name: "Hannah", avatar: "/images/avatar/8.png" },
  { id: "u9", name: "Ivan", avatar: "/images/avatar/9.png" },
  { id: "u10", name: "Julia", avatar: "/images/avatar/10.png" }
]);

const mediaAssets = ref([
  "/images/servers/1.png",
  "/images/servers/2.png",
  "/images/servers/3.png"
]);
</script>
