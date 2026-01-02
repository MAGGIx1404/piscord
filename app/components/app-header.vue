<template>
  <header
    class="bg-background sticky top-0 flex h-auto shrink-0 items-center justify-between gap-2 py-4 transition-[width,height] ease-linear z-3"
  >
    <div class="flex items-center gap-2">
      <SidebarTrigger />
      <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem class="hidden md:block">
            <BreadcrumbLink href="#"> Orion Group </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator class="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage> Dashboard </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>

    <ThemeChanger />
  </header>
</template>
