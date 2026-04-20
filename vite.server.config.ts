import path from "node:path";
import { defineConfig } from "vite";

const external = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
];

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/server.ts"),
      name: "UziServer",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "server.js" : "server.cjs"),
    },
    sourcemap: true,
    emptyOutDir: false,
    rollupOptions: {
      external,
    },
  },
});
