<template>
  <div class="flex flex-col transition-all p-3 rounded-xl hover:bg-gray-100 relative">
    <!-- Primary Chat of reply -->
    <div
      v-if="replyToMessage"
      class="ml-5 p-3 mb-2 flex items-center gap-2 rounded-xl transition-all hover:bg-gray-200"
    >
      <Avatar class="border-2 border-black rounded-lg size-6">
        <AvatarImage :src="replyToMessage.author.image" alt="@User" />
        <AvatarFallback>
          {{ replyToMessage.author.name.charAt(0) }}
        </AvatarFallback>
      </Avatar>
      <div>
        <div class="flex items-center gap-1 text-gray-700 text-sm">
          <span class="font-semibold">{{ replyToMessage.author.name }}</span>
          <span>{{
            replyToMessage.message.length > 100
              ? replyToMessage.message.slice(0, 100) + "..."
              : replyToMessage.message
          }}</span>
        </div>
      </div>
    </div>

    <!-- Chat -->
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
          <span class="text-sm text-gray-500"
            >{{ new Date(chat.timestamp).toLocaleTimeString() }}
          </span>
        </div>
        <p class="mt-1">{{ chat.message }}</p>
      </div>
    </div>

    <!-- Chat's reactions -->
    <div class="w-full"></div>
  </div>
</template>

<script setup>
defineProps({
  chat: {
    type: Object,
    required: true
  },
  replyToMessage: {
    type: Object,
    required: false
  }
});
</script>
