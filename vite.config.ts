import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  build: {
    chunkSizeWarningLimit: 1200,
    rolldownOptions: {
      output: {
        // Vite 8 ships Rolldown: manualChunks must be a function.
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@react-three") || id.includes("three-stdlib") || id.includes("/three/"))
            return "three";
          if (id.includes("/gsap/") || id.includes("@gsap")) return "gsap";
          if (id.includes("/motion/") || id.includes("motion-dom") || id.includes("framer-motion"))
            return "motion";
          return undefined;
        },
      },
    },
  },
});
