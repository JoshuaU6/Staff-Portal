import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  base: process.env.BASE_PATH ?? "/portal/",
  plugins: [
    react(),
    tailwindcss({ optimize: false }),
  ],
  resolve: {
  alias: {
    "@": path.resolve(import.meta.dirname, "src"),
    "@hookform/resolvers/zod": path.resolve(import.meta.dirname, "node_modules/@hookform/resolvers/zod"),
  },
  dedupe: ["react", "react-dom", "@tanstack/react-query"],
},
  root: path.resolve(import.meta.dirname),
  define: {
    "import.meta.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify(
      process.env.CLERK_PUBLISHABLE_KEY ||
      process.env.VITE_CLERK_PUBLISHABLE_KEY ||
      "",
    ),
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: Number(process.env.PORT ?? 3000),
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: Number(process.env.PORT ?? 3000),
    host: "0.0.0.0",
  },
});