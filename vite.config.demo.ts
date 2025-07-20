import { defineConfig } from "npm:vite";

export default defineConfig({
  root: "demo",
  base: process.env.BASE ?? "/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});