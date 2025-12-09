<template>
  <div class="relative">
    <div
      class="max-w-1/2 flex items-end gap-2"
      :class="chat.author.id === userId ? 'ml-auto flex-row-reverse' : ''"
    >
      <Avatar class="size-14 border-2 border-black rounded-lg">
        <AvatarImage :src="chat.author.image" alt="@Server" />
        <AvatarFallback>US</AvatarFallback>
      </Avatar>

      <!-- Message -->
      <Card
        class="w-full mb-2 gap-4"
        :class="
          chat.author.id === userId
            ? 'rounded-br-none bg-primary text-primary-foreground'
            : 'rounded-bl-none bg-accent'
        "
      >
        <p class="text-base">
          {{ chat.message }}
        </p>

        <!-- media -->
        <div class="w-full grid grid-cols-2 gap-4" v-if="chat.images.length">
          <figure
            class="h-52 border-2 border-black rounded-xl"
            v-for="media in chat.images"
            :key="media"
          >
            <img :src="media" alt="chat media" class="size-full" />
          </figure>
        </div>

        <div
          class="w-full flex items-center justify-between"
          :class="chat.author.id === userId ? 'flex-row-reverse' : ''"
        >
          <p class="text-xs">@{{ chat.author.id === userId ? "You" : chat.author.name }}</p>
          <p class="text-xs">
            {{
              new Date(chat.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              })
            }}
          </p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>
const store = useUserStore();
const userId = store.user.id;

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
