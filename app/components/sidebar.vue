<template>
  <Card class="w-full h-full col-span-3 flex flex-col justify-between gap-6">
    <!-- content -->
    <div class="w-full flex flex-col gap-4">
      <!-- Current Server -->
      <div class="w-full flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <Avatar class="size-12">
            <AvatarImage src="/images/servers/1.png" alt="Server" />
            <AvatarFallback> AG </AvatarFallback>
          </Avatar>
          <div class="flex flex-col">
            <p class="text-lg font-medium text-primary">Age of Empires</p>
            <p class="text-sm text-muted-foreground">12 members</p>
          </div>
        </div>

        <WidgetsServersList />
      </div>

      <Separator />
    </div>

    <!-- Userbox -->
    <Button variant="secondary" class="justify-between gap-3">
      <Avatar class="size-12">
        <AvatarImage src="/images/avatar/1.png" alt="Server" />
        <AvatarFallback> AG </AvatarFallback>
      </Avatar>

      <div class="flex flex-col text-left mr-auto">
        <p class="text-base font-medium text-primary">Alexander G.</p>
        <p class="text-sm text-muted-foreground">#1234</p>
      </div>
    </Button>
  </Card>
</template>
