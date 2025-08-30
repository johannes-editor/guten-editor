// import { defineConfig } from "npm:vite";

// export default defineConfig({
//   root: "demo",
//   publicDir: "public",
//   build: {
//     outDir: "dist",
//     emptyOutDir: true,
//   },
// });

import { defineConfig } from "npm:vite";

export default defineConfig({
    root: "demo",
    publicDir: "public",


    build: {
        outDir: "dist",
        emptyOutDir: true,
        minify: "esbuild",
        sourcemap: true,
    },
    esbuild: {
        keepNames: true,
    },
});
