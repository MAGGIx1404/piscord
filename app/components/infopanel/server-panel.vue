<template>
  <div class="size-full flex flex-col">
    <!-- Poster -->
    <figure class="w-full h-40 border-b-2 border-black">
      <img src="/images/servers/4.png" alt="image" class="size-full" />
    </figure>

    <!-- Info -->
    <div class="w-full px-4 flex flex-col items-center gap-3">
      <Avatar class="-mt-10 border-2 border-black shadow-xl rounded-lg size-20">
        <AvatarImage src="/images/servers/1.png" alt="@Server" />
        <AvatarFallback>US</AvatarFallback>
      </Avatar>
      <h1 class="text-xl font-semibold">SecureHost ⚔️</h1>
      <div class="w-full flex items-center justify-center gap-4">
        <p class="text-base flex items-center justify-center gap-1">
          <Status /> <strong>32.2k</strong> Online
        </p>
        <p class="text-base flex items-center justify-center gap-1">
          <Status type="offline" /> <strong>312.2k</strong> Members
        </p>
      </div>
      <Separator />
    </div>

    <!-- Channels -->
    <div class="size-full overflow-hidden flex-1 relative">
      <div class="size-full overflow-y-scroll p-4">
        <div class="w-full py-4 space-y-2">
          <Accordion type="single" collapsible class="w-full" default-value="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>TEXT CHANNELS</AccordionTrigger>
              <AccordionContent>
                <Button variant="secondary" class="justify-start" as-child>
                  <NuxtLink to="/"> <Antenna /> Default Channel </NuxtLink>
                </Button>
                <Button
                  variant="outline"
                  class="justify-start shadow-none"
                  v-for="n in 8"
                  :key="n"
                  as-child
                >
                  <NuxtLink to="/"> <Antenna /> Channel {{ n }} </NuxtLink>
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <!-- Overlay -->
      <FadeOverlay />
    </div>
  </div>
</template>

<script setup>
import { Antenna } from "lucide-vue-next";
</script>
