<template>
  <main class="w-full h-[calc(100vh-32px)] flex flex-col">
    <div class="size-full flex flex-col items-center justify-center gap-4">
      <Card class="max-w-1/2 w-full p-0">
        <!-- Poster -->
        <figure class="w-full h-80">
          <FileInput>
            <template #trigger>
              <div class="flex flex-col items-center justify-center text-center">
                <Button size="icon" variant="secondary">
                  <ImagePlus />
                </Button>
                <p class="text-sm mt-4">Click to upload or drag and drop</p>
                <p class="text-xs">SVG, PNG, JPG or GIF (max. 800x400px)</p>
              </div>
            </template>
          </FileInput>
        </figure>
      </Card>
    </div>
  </main>
</template>

<script setup>
import { CreditCard, Truck, ImagePlus } from "lucide-vue-next";
</script>
