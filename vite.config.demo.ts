import { defineConfig } from "npm:vite";

export default defineConfig({
  root: "demo",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});