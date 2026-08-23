// vite.config.js
//
// Vite is the build tool for this React app — it's what turns
// src/main.jsx into an optimized static bundle for "npm run build",
// and provides the fast dev server for "npm run dev".

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
