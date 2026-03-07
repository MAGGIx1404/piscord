<template>
  <header
    class="bg-background sticky top-0 flex h-auto shrink-0 items-center justify-between gap-2 py-4 transition-[width,height] ease-linear z-3"
  >
    <div class="flex items-center gap-2">
      <SidebarTrigger />
      <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
      <Breadcrumb v-if="communityId">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" class="capitalize">
              {{ communityId.replaceAll("_", " ") }}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <template v-if="channelId">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/"> Channels </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage class="capitalize"> {{ channelId }} </BreadcrumbPage>
            </BreadcrumbItem>
          </template>
          <template v-else-if="workspaceId">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/"> Workspaces </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage class="capitalize"> {{ workspaceId }} </BreadcrumbPage>
            </BreadcrumbItem>
          </template>
        </BreadcrumbList>
      </Breadcrumb>
    </div>

    <NavUser />
  </header>
</template>

<script setup>
const route = useRoute();
const channelId = ref("");
const communityId = ref("");
const workspaceId = ref("");

watch(
  route,
  (newRoute) => {
    const { community_id, channel_id, workspace_id } = newRoute.params;
    communityId.value = community_id;
    channelId.value = channel_id;
    workspaceId.value = workspace_id;
  },
  { immediate: true }
);
</script>
