import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },

  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/hints",
    "@nuxt/scripts",
    "shadcn-nuxt",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
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

  nitro: {
    experimental: {
      websocket: true
    }
  },

  css: ["@/assets/css/main.css"],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        "lucide-vue-next",
        "vue-sonner",
        "clsx",
        "tailwind-merge",
        "yup",
        "vee-validate",
        "class-variance-authority",
        "@vueuse/core",
        "reka-ui",
        "marked",
        "dompurify",
        "@tiptap/vue-3",
        "@tiptap/starter-kit",
        "@tiptap/extension-placeholder",
        "@tiptap/extension-text-align",
        "@tiptap/extension-highlight",
        "@tiptap/extension-typography",
        "@tiptap/core",
        "@tiptap/pm/state",
        "@tiptap/pm/view"
      ]
    }
  },

  runtimeConfig: {
    JWT_SECRET: process.env.JWT_SECRET
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
