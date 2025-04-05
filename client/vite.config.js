import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL || "https://your-backend-api-url.vercel.app/api")
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: true,
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  }
});
