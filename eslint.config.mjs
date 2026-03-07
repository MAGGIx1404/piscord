// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";
import tailwindcss from "eslint-plugin-tailwindcss";

export default withNuxt({
  ...tailwind.configs["flat/recommended"]
});
// Your custom configs here
