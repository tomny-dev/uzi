import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ["react", "react-dom"],
    esbuildOptions(options) {
      options.loader = {
        ...options.loader,
        ".module.css": "local-css",
        ".css": "css",
      };
    },
    banner: {
      js: '"use client";',
    },
  },
  {
    entry: { server: "src/server.ts" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    external: ["react", "react-dom"],
  },
]);
