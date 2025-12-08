<template>
  <Tabs default-value="messages" class="h-full p-4">
    <TabsList class="grid grid-cols-2 w-full">
      <TabsTrigger value="messages"> Messages </TabsTrigger>
      <TabsTrigger value="friends"> Friends </TabsTrigger>
    </TabsList>
    <Separator />
    <TabsContent value="messages" class="h-full">
      <!-- Messages Panel -->
      <div class="size-full flex flex-col gap-3">
        <NuxtLink
          :to="`/chat/${user.id}`"
          class="w-full flex items-center gap-2.5 p-2.5 border-2 border-dotted border-black rounded-lg relative"
          :class="{
            'border-solid bg-accent shadow-xl':
              route.name === 'chat-id' && route.params.id == user.id
          }"
          v-for="user in users"
          :key="user.id"
        >
          <Avatar class="border-2 border-black rounded-lg">
            <AvatarImage :src="user.avatar" alt="@User" />
            <AvatarFallback>
              {{ user.name.charAt(0) }}
            </AvatarFallback>
          </Avatar>
          <div class="w-full">
            <h1 class="text-lg font-semibold">{{ user.name }}</h1>
            <p class="text-sm">Hello! This is a...</p>
          </div>
        </NuxtLink>
      </div>
    </TabsContent>
    <TabsContent value="friends">
      <!-- Friends List -->
      <div class="w-full space-y-6">
        <h1>hiiiiii</h1>
      </div>
    </TabsContent>
  </Tabs>
</template>

<script setup>
const route = useRoute();

const users = [
  {
    id: 1,
    name: "John Doe",
    avatar: "/images/avatar/1.png"
  },
  {
    id: 2,
    name: "Jane Smith",
    avatar: "/images/avatar/2.png"
  },
  {
    id: 3,
    name: "Alice Johnson",
    avatar: "/images/avatar/3.png"
  },
  {
    id: 4,
    name: "Bob Brown",
    avatar: "/images/avatar/4.png"
  },
  {
    id: 5,
    name: "Charlie Davis",
    avatar: "/images/avatar/5.png"
  }
];
</script>
