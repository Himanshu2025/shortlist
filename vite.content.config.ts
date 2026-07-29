import { defineConfig } from "vite";
import { resolve } from "node:path";

// Pass 2: the content script. This has to be ONE self-contained IIFE file
// with no separate chunks — Chrome only serves files listed in
// web_accessible_resources to the page, and we ship none, so nothing this
// script needs can be a dynamically-loaded chunk. emptyOutDir is false so
// this build lands alongside the extension-pages build from vite.config.ts.
export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, "src/content/index.ts"),
      formats: ["iife"],
      name: "ShortlistContent",
      fileName: () => "content.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        extend: true,
      },
    },
  },
});
