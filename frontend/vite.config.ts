import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    define: {
      global: "window",
    },
    resolve: {
      alias: {
        buffer: "buffer/",
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
      include: ["buffer"],
    },
    server: {
      // FIX FOR SECURITY AUDIT: Restricts binding to local loopback to prevent network eavesdropping
      host: "127.0.0.1",
      port: 3000,

      // FIX FOR SECURITY AUDIT: Locks file read scopes to project directory root, neutralizing the esbuild bug
      fs: {
        strict: true,
      },

      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
        "/uploads": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
      },
      hmr: process.env.DISABLE_HMR !== "true",
    },
  };
});
