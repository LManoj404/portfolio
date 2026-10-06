import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { apiHandler } from "./server/api.mjs";

// Serves /api/* in both `vite dev` and `vite preview` so the contact form and
// the WhatsApp redirect work with the plain `npm run dev`/`npm run preview`.
function portfolioApi() {
  return {
    name: "portfolio-api",
    configureServer(server) {
      server.middlewares.use(apiHandler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(apiHandler);
    },
  };
}

export default defineConfig({
  plugins: [react(), portfolioApi()],
  server: {
    port: 5173,
    strictPort: false,
  },
  // Keep Rapier's physics code + compat un-bundled so its WASM loads through
  // our explicit URL (/rapier/rapier_wasm3d_bg.wasm) in dev too.
  optimizeDeps: {
    exclude: ["@react-three/rapier", "@dimforge/rapier3d-compat"],
  },
  assetsInclude: ["**/*.glb", "**/*.wasm"],
  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          "framer-motion": ["framer-motion"],
          rapier: ["@react-three/rapier"],
        },
      },
    },
  },
});