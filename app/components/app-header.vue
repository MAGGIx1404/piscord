<template>
  <header
    class="bg-background sticky top-0 flex h-auto shrink-0 items-center justify-between gap-2 py-4 transition-[width,height] ease-linear z-3"
  >
    <div class="flex items-center gap-2">
      <SidebarTrigger />
      <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
      <Breadcrumb v-if="teamId">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" class="capitalize">
              {{ teamId.replaceAll("_", " ") }}
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
        </BreadcrumbList>
      </Breadcrumb>
    </div>

    <div class="flex items-center">
      <ThemeChanger />
      <TeamInfoSheet />
    </div>
  </header>
</template>

<script setup>
const route = useRoute();
const channelId = ref("");
const teamId = ref("");

const { teamId: team_id, channelId: channel_id } = route.params;

watch(
  route,
  (newRoute) => {
    const { team_id, channel_id } = newRoute.params;
    teamId.value = team_id;
    channelId.value = channel_id;
  },
  { immediate: true }
);
</script>
