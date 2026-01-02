<template>
  <header class="flex h-auto shrink-0 items-center gap-2 transition-[width,height] ease-linear">
    <div class="flex items-center gap-2">
      <SidebarTrigger />
      <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem class="hidden md:block">
            <BreadcrumbLink href="#"> Server One </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator class="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage> Dashboard </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  </header>
</template>
