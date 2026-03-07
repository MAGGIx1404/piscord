<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <div class="flex flex-1 flex-col gap-4 p-4 pt-0 w-full">
        <AppHeader />
        <slot />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup></script>
