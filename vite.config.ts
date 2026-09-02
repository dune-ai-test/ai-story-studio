import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: true,
  },
  build: {
    target: "ES2020",
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
  },
});