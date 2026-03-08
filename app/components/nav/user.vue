<script setup lang="ts">
import { BadgeCheck, Bell, LogOut, Sparkles, Settings } from "lucide-vue-next";

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const { logout } = useAuth();
const router = useRouter();

const userInitials = computed(() => (user.value?.username ?? "U").slice(0, 2).toUpperCase());
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger class="size-10 min-h-10 cursor-pointer overflow-hidden">
      <Avatar class="size-full rounded-lg">
        <AvatarImage :src="user?.avatar_url ?? ''" :alt="user?.username" />
        <AvatarFallback class="rounded-lg">{{ userInitials }}</AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      class="w-[--reka-dropdown-menu-trigger-width] min-w-64 rounded-lg"
      align="end"
      :side-offset="4"
    >
      <DropdownMenuLabel class="p-0 font-normal">
        <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar class="h-8 w-8 rounded-lg">
            <AvatarImage :src="user?.avatar_url ?? ''" :alt="user?.username" />
            <AvatarFallback class="rounded-lg">{{ userInitials }}</AvatarFallback>
          </Avatar>
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-semibold">{{ user?.username ?? "—" }}</span>
            <span class="truncate text-xs">{{ user?.email ?? "" }}</span>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <Sparkles />
          Upgrade to Pro
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem @click="router.push('/me/settings')">
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem @click="router.push('/me/settings?tab=security')">
          <BadgeCheck />
          Security
        </DropdownMenuItem>
        <DropdownMenuItem @click="router.push('/me/settings?tab=notifications')">
          <Bell />
          Notifications
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="logout">
        <LogOut />
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
