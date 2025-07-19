import { defineConfig } from "npm:vite";

export default defineConfig({
  server: {
    fs: {
      allow: ['..'],
    },
  },
  build: {
    outDir: "build",
    emptyOutDir: true,
    lib: {
      entry: "./src/loader.ts",
      name: "GutenEditor",
      formats: ["es"],
      fileName: () => "loader.js",
    },
  },
});