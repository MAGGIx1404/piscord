<template>
  <Select>
    <SelectTrigger class="size-9 flex items-center justify-center" :show-icon="false">
      <ChevronDown class="size-5" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem v-for="server in servers" :key="server.id" :value="server.name">
          <Avatar>
            <AvatarImage :src="server.image" :alt="server.name" />
            <AvatarFallback>
              {{ server.name.charAt(0) }}
            </AvatarFallback>
          </Avatar>
          {{ server.name }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>

<script setup>
import { ChevronDown } from "lucide-vue-next";

const servers = [
  {
    id: 1,
    name: "Dev-land",
    image: "/images/servers/1.png"
  },
  {
    id: 2,
    name: "Valorant RP",
    image: "/images/servers/2.png"
  },
  {
    id: 3,
    name: "GTA RP",
    image: "/images/servers/3.png"
  },
  {
    id: 4,
    name: "FiveM RP",
    image: "/images/servers/4.png"
  }
];
</script>
