import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1421,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/mathlive/") || id.includes("\\mathlive\\")) {
            return "mathlive";
          }
          return undefined;
        },
      },
    },
  },
});
