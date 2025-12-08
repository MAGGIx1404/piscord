<template>
  <Card>
    <Tabs default-value="servers">
      <TabsList>
        <TabsTrigger value="servers"> My Servers </TabsTrigger>
        <TabsTrigger value="discover"> Discover </TabsTrigger>
      </TabsList>
      <TabsContent value="servers">
        <div class="w-full space-y-6">
          <ServersSearch my-servers />
          <ServersList />
        </div>
      </TabsContent>
      <TabsContent value="discover">
        <div class="w-full space-y-6">
          <h1>No servers</h1>
        </div>
      </TabsContent>
    </Tabs>
  </Card>
</template>
