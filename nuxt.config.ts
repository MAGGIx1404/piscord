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
      },
      {
        name: "Inter",
        weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
        styles: ["normal", "italic"],
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
  },

  app: {
    head: {
      script: [
        {
          innerHTML: `
                    if (localStorage.theme === "dark" || (!('theme' in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                        document.documentElement.setAttribute("data-theme", "dark")
                        document.documentElement.classList.add("dark")
                    } else {
                        document.documentElement.removeAttribute("data-theme")
                        document.documentElement.classList.remove("dark")
                    }
                `,
          type: "text/javascript"
        }
      ]
    }
  }
});
