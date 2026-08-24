import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@tomny-dev/uzi": path.resolve(__dirname, "../src"),
    },
  },
  css: {
    modules: {
      generateScopedName: "uzi-[name]__[local]__[hash:base64:5]",
    },
  },
});
