<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <div class="flex w-full flex-1 flex-col p-4 pt-0">
        <AppHeader />
        <slot />
      </div>
    </SidebarInset>
  </SidebarProvider>

  <!-- Global 2FA setup modal -->
  <Enable2FAModal />
</template>

<script setup></script>
