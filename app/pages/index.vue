<template>
  <main class="w-full h-[calc(100vh-32px)] grid place-items-center">
    <!-- Welcome Screen -->
    <div
      class="w-1/2 flex flex-col items-center justify-center text-center -space-y-2 rounded-xl bg-white overflow-hidden border-4 border-black shadow-2xl"
    >
      <figure class="w-full h-[550px] bg-accent border-b-4 border-black">
        <img src="/images/welcome.png" alt="Welcome Screen Image" class="size-full" />
      </figure>

      <div class="w-full p-8 flex flex-col items-center gap-4">
        <h1 class="text-4xl font-bold">Welcome to Piscord !</h1>
        <p class="text-sm w-9/12">
          Piscord is a community-driven platform where you can connect, share, and collaborate with
          others. Join us to explore exciting features and engage.
        </p>
        <div class="space-x-4 mt-2">
          <Button> Search for Servers </Button>
          <Button variant="secondary"> Find Friends </Button>
        </div>
      </div>
    </div>
  </main>
</template>
