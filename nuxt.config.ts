import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },

  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/hints",
    "@prisma/nuxt",
    "@nuxt/scripts",
    "shadcn-nuxt",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "motion-v/nuxt",
    "@nuxt/image"
  ],

  shadcn: {
    prefix: "",
    componentDir: "@/components/ui"
  },

  fonts: {
    families: [
      {
        name: "Dm Sans",
        weights: ["300", "400", "500", "600", "700", "800", "900"],
        styles: ["normal"],
        subsets: ["latin"],
        provider: "google",
        preload: true
      }
    ],
    priority: ["google"]
  },

  css: ["@/assets/css/main.css"],

  vite: {
    plugins: [tailwindcss()]
  },

  runtimeConfig: {
    JWT_SECRET: process.env.JWT_SECRET,
    MINIO_HOST: process.env.MINIO_HOST
  }
});
