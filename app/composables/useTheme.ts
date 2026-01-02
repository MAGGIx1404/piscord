import { useState } from "nuxt/app";
import { onMounted } from "vue";

export default function useTheme() {
  const enabled = useState<boolean | null>("theme", () => null);

  onMounted(() => {
    enabled.value = localStorage.getItem("theme") === "dark" ? true : false;
  });

  const toggleTheme = () => {
    enabled.value = !enabled.value;
    localStorage.setItem("theme", enabled.value ? "dark" : "light");
    setTheme();
  };

  function setTheme() {
    const theme = localStorage.getItem("theme");
    if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.classList.remove("dark");
    }
  }

  return {
    enabled,
    toggleTheme,
    setTheme
  };
}
