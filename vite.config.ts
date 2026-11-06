import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// GitHub Actions sets BASE_PATH to the Pages path, e.g. /hello-lit/.
// Local dev and preview stay at /.
function basePath(): string {
  const raw = process.env.BASE_PATH;
  if (!raw || raw === "/") return "/";
  const withLeading = raw.startsWith("/") ? raw : `/${raw}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

export default defineConfig({
  base: basePath(),
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
        chip: "chip.html",
        combobox: "combobox.html",
        dialog: "dialog.html",
        tooltip: "tooltip.html",
        popover: "popover.html",
        form: "form.html",
        "inline-edit": "inline-edit.html",
        "dropdown-menu": "dropdown-menu.html",
      },
    },
  },
});
