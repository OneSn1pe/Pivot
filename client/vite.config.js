import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Support for Netlify environment
    "process.env.VITE_API_URL": JSON.stringify(
      process.env.VITE_API_URL || 
      (process.env.NETLIFY ? `${process.env.URL}/.netlify/functions` : '/.netlify/functions')
    )
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
