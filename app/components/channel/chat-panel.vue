<template>
  <div class="size-full relative">
    <!-- Chat panel -->
    <div class="size-full space-y-4 overflow-hidden">
      <div class="size-full overflow-y-scroll py-32">
        <!-- Chats -->
        <div
          class="flex flex-col transition-all p-3 rounded-xl hover:bg-gray-100"
          v-for="chat in chats"
          :key="chat.id"
        >
          <div class="flex items-start gap-3">
            <Avatar class="border-2 border-black shadow-lg rounded-lg">
              <AvatarImage :src="chat.author.image" alt="@User" />
              <AvatarFallback>
                {{ chat.author.name.charAt(0) }}
              </AvatarFallback>
            </Avatar>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-semibold">{{ chat.author.name }}</span>
                <span class="text-sm text-gray-500">{{
                  new Date(chat.timestamp).toLocaleTimeString()
                }}</span>
              </div>
              <p class="mt-1">{{ chat.message }}</p>
            </div>
          </div>
          <!-- Replies -->
          <div class="ml-12 mt-4 space-y-4" v-for="reply in chat.replies" :key="reply.id">
            <div class="flex items-start gap-3">
              <Avatar class="border-2 border-black shadow-lg rounded-lg">
                <AvatarImage :src="reply.author.image" alt="@User" />
                <AvatarFallback>
                  {{ reply.author.name.charAt(0) }}
                </AvatarFallback>
              </Avatar>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-semibold">{{ reply.author.name }}</span>
                  <span class="text-sm text-gray-500">{{
                    new Date(reply.timestamp).toLocaleTimeString()
                  }}</span>
                </div>
                <p class="mt-1">{{ reply.message }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ChannelChatForm />
  </div>
</template>

<script setup>
const chats = [
  {
    id: "m1",
    author: { name: "Alice", image: "/images/avatar/1.png" },
    message: "Hey team, did we finalize the API endpoints?",
    timestamp: "2025-12-08T09:01:00Z",
    replies: [
      {
        id: "m1_r1",
        author: { name: "Jeet", image: "/images/avatar/2.png" },
        message: "Almost done, reviewing the last few ones.",
        timestamp: "2025-12-08T09:03:00Z"
      },
      {
        id: "m1_r2",
        author: { name: "Ryan", image: "/images/avatar/3.png" },
        message: "We can merge after today’s stand-up.",
        timestamp: "2025-12-08T09:05:00Z"
      }
    ]
  },
  {
    id: "m2",
    author: { name: "Ryan", image: "/images/avatar/3.png" },
    message: "Anyone tested the new auth flow?",
    timestamp: "2025-12-08T09:10:00Z",
    replies: []
  },
  {
    id: "m3",
    author: { name: "Jeet", image: "/images/avatar/2.png" },
    message: "Yes, working fine on local but throws a warning on production.",
    timestamp: "2025-12-08T09:12:00Z",
    replies: [
      {
        id: "m3_r1",
        author: { name: "Alice", image: "/images/avatar/1.png" },
        message: "Is it the CORS issue again?",
        timestamp: "2025-12-08T09:14:00Z"
      }
    ]
  },
  {
    id: "m4",
    author: { name: "Sam", image: "/images/avatar/4.png" },
    message: "Morning! I pushed UI updates for the dashboard.",
    timestamp: "2025-12-08T09:16:00Z",
    replies: []
  },
  {
    id: "m5",
    author: { name: "Jeet", image: "/images/avatar/2.png" },
    message: "Nice! I’ll check them now.",
    timestamp: "2025-12-08T09:17:30Z",
    replies: []
  },
  {
    id: "m6",
    author: { name: "Ryan", image: "/images/avatar/3.png" },
    message: "We need to decide on the color theme today.",
    timestamp: "2025-12-08T09:20:00Z",
    replies: [
      {
        id: "m6_r1",
        author: { name: "Sam", image: "/images/avatar/4.png" },
        message: "We can try a dark crypto-style palette.",
        timestamp: "2025-12-08T09:22:00Z"
      }
    ]
  },
  {
    id: "m7",
    author: { name: "Alice", image: "/images/avatar/1.png" },
    message: "I'll create three sample themes for review.",
    timestamp: "2025-12-08T09:23:00Z",
    replies: []
  },
  {
    id: "m8",
    author: { name: "Sam", image: "/images/avatar/4.png" },
    message: "Does anyone know why build size increased by 2MB?",
    timestamp: "2025-12-08T09:25:00Z",
    replies: [
      {
        id: "m8_r1",
        author: { name: "Jeet", image: "/images/avatar/2.png" },
        message: "Maybe due to the new chart library?",
        timestamp: "2025-12-08T09:26:30Z"
      },
      {
        id: "m8_r2",
        author: { name: "Ryan", image: "/images/avatar/3.png" },
        message: "Yes, we added three heavy dependencies.",
        timestamp: "2025-12-08T09:27:10Z"
      }
    ]
  },
  {
    id: "m9",
    author: { name: "Alice", image: "/images/avatar/1.png" },
    message: "We should remove unused icons from the bundle.",
    timestamp: "2025-12-08T09:30:00Z",
    replies: []
  },
  {
    id: "m10",
    author: { name: "Ryan", image: "/images/avatar/3.png" },
    message: "Good idea. That will reduce ~500kb.",
    timestamp: "2025-12-08T09:32:00Z",
    replies: []
  },

  /* --- Continue messages up to 35 --- */

  {
    id: "m11",
    author: { name: "Sam", image: "/images/avatar/4.png" },
    message: "Reminder: deploy to staging at 6 PM.",
    timestamp: "2025-12-08T10:00:00Z",
    replies: []
  },
  {
    id: "m12",
    author: { name: "Jeet", image: "/images/avatar/2.png" },
    message: "I'll handle database migration.",
    timestamp: "2025-12-08T10:02:00Z",
    replies: []
  },
  {
    id: "m13",
    author: { name: "Ryan", image: "/images/avatar/3.png" },
    message: "Can someone test the notifications module?",
    timestamp: "2025-12-08T10:03:00Z",
    replies: [
      {
        id: "m13_r1",
        author: { name: "Alice", image: "/images/avatar/1.png" },
        message: "I'll test it after lunch.",
        timestamp: "2025-12-08T10:04:00Z"
      }
    ]
  },
  {
    id: "m14",
    author: { name: "Alice", image: "/images/avatar/1.png" },
    message: "Also added animations to buttons. Check if too much.",
    timestamp: "2025-12-08T10:05:00Z",
    replies: []
  },
  {
    id: "m15",
    author: { name: "Sam", image: "/images/avatar/4.png" },
    message: "Looks smooth on my system.",
    timestamp: "2025-12-08T10:08:00Z",
    replies: []
  },
  {
    id: "m16",
    author: { name: "Jeet", image: "/images/avatar/2.png" },
    message: "One issue: animation lags on mobile.",
    timestamp: "2025-12-08T10:10:00Z",
    replies: []
  },
  {
    id: "m17",
    author: { name: "Ryan", image: "/images/avatar/3.png" },
    message: "We can reduce transition duration.",
    timestamp: "2025-12-08T10:11:00Z",
    replies: []
  },
  {
    id: "m18",
    author: { name: "Alice", image: "/images/avatar/1.png" },
    message: "Done! New duration is 180ms.",
    timestamp: "2025-12-08T10:13:00Z",
    replies: []
  },
  {
    id: "m19",
    author: { name: "Sam", image: "/images/avatar/4.png" },
    message: "Uploading assets to CDN now.",
    timestamp: "2025-12-08T10:15:00Z",
    replies: []
  },
  {
    id: "m20",
    author: { name: "Jeet", image: "/images/avatar/2.png" },
    message: "CDN versioning working fine?",
    timestamp: "2025-12-08T10:17:00Z",
    replies: []
  },
  {
    id: "m21",
    author: { name: "Ryan", image: "/images/avatar/3.png" },
    message: "Yes, tested with cache-busting.",
    timestamp: "2025-12-08T10:18:00Z",
    replies: []
  },
  {
    id: "m22",
    author: { name: "Alice", image: "/images/avatar/1.png" },
    message: "We should schedule a UI review meeting.",
    timestamp: "2025-12-08T10:20:00Z",
    replies: []
  },
  {
    id: "m23",
    author: { name: "Sam", image: "/images/avatar/4.png" },
    message: "Tomorrow 11 AM works?",
    timestamp: "2025-12-08T10:23:00Z",
    replies: []
  },
  {
    id: "m24",
    author: { name: "Jeet", image: "/images/avatar/2.png" },
    message: "Yes, available.",
    timestamp: "2025-12-08T10:24:00Z",
    replies: []
  },
  {
    id: "m25",
    author: { name: "Ryan", image: "/images/avatar/3.png" },
    message: "Working on analytics integration.",
    timestamp: "2025-12-08T10:30:00Z",
    replies: []
  },
  {
    id: "m26",
    author: { name: "Alice", image: "/images/avatar/1.png" },
    message: "Great! Will track UI interactions too?",
    timestamp: "2025-12-08T10:32:00Z",
    replies: []
  },
  {
    id: "m27",
    author: { name: "Ryan", image: "/images/avatar/3.png" },
    message: "Yes, all click & view events.",
    timestamp: "2025-12-08T10:33:00Z",
    replies: [
      {
        id: "m27_r1",
        author: { name: "Jeet", image: "/images/avatar/2.png" },
        message: "Don’t track private page views.",
        timestamp: "2025-12-08T10:34:00Z"
      }
    ]
  },
  {
    id: "m28",
    author: { name: "Sam", image: "/images/avatar/4.png" },
    message: "Build finished successfully!",
    timestamp: "2025-12-08T10:40:00Z",
    replies: []
  },
  {
    id: "m29",
    author: { name: "Jeet", image: "/images/avatar/2.png" },
    message: "Running tests now.",
    timestamp: "2025-12-08T10:42:00Z",
    replies: []
  },
  {
    id: "m30",
    author: { name: "Alice", image: "/images/avatar/1.png" },
    message: "Test #14 failing.",
    timestamp: "2025-12-08T10:43:00Z",
    replies: []
  },
  {
    id: "m31",
    author: { name: "Ryan", image: "/images/avatar/3.png" },
    message: "Probably due to async bug.",
    timestamp: "2025-12-08T10:45:00Z",
    replies: []
  },
  {
    id: "m32",
    author: { name: "Jeet", image: "/images/avatar/2.png" },
    message: "Fixed it — missing await.",
    timestamp: "2025-12-08T10:47:00Z",
    replies: []
  },
  {
    id: "m33",
    author: { name: "Sam", image: "/images/avatar/4.png" },
    message: "Nice catch Jeet!",
    timestamp: "2025-12-08T10:48:00Z",
    replies: []
  },
  {
    id: "m34",
    author: { name: "Alice", image: "/images/avatar/1.png" },
    message: "All tests green now.",
    timestamp: "2025-12-08T10:50:00Z",
    replies: []
  },
  {
    id: "m35",
    author: { name: "Ryan", image: "/images/avatar/3.png" },
    message: "Great work team! 🎉",
    timestamp: "2025-12-08T10:52:00Z",
    replies: []
  }
];
</script>
