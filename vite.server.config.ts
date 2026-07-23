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
      entry: {
        server: path.resolve(__dirname, "src/server.ts"),
        utils: path.resolve(__dirname, "src/utils.ts"),
      },
      name: "UziServer",
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `${entryName}.${format === "es" ? "js" : "cjs"}`,
    },
    sourcemap: true,
    emptyOutDir: false,
    rollupOptions: {
      external,
    },
  },
});
