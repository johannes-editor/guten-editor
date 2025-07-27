import { defineConfig } from "npm:vite";

export default defineConfig({
  root: "demo",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "assets/loader.js",
        chunkFileNames: "assets/[hash].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});