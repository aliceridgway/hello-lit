import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith("ui-"),
        },
      },
    }),
    svelte(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        button: "button.html",
        dialog: "dialog.html",
        tooltip: "tooltip.html",
        popover: "popover.html",
        form: "form.html",
      },
    },
  },
});
