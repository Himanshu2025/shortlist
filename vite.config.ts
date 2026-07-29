import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

// Pass 1: extension pages (options, popup). Ordinary Vite MPA build —
// these are top-level extension surfaces, not injected into the host page,
// so code-splitting and multiple chunks are fine here.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        options: resolve(__dirname, "options.html"),
        popup: resolve(__dirname, "popup.html"),
      },
    },
  },
});
