import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const external = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  /^@radix-ui\//,
];

export default defineConfig({
  plugins: [react()],
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
    },
  },
  css: {
    modules: {
      generateScopedName: "uzi-[name]__[local]__[hash:base64:5]",
    },
  },
});
