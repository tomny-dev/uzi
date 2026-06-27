import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

const external = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
];

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "Uzi",
      formats: ["es", "cjs"],
      cssFileName: "style",
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
    },
    sourcemap: true,
    cssCodeSplit: false,
    emptyOutDir: true,
    rollupOptions: {
      external,
      output: {
        banner: '"use client";',
      },
    },
  },
  css: {
    modules: {
      generateScopedName: "uzi-[name]__[local]__[hash:base64:5]",
    },
  },
});
