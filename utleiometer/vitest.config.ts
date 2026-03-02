import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,

    // Viktig for @testing-library/jest-dom, FormData polyfills, osv.
    setupFiles: ["./src/tests/setupTests.ts"],

    // Samler begge branchers mønstre (inkluderer både src/tests og src/**/__tests__ osv)
    include: [
      "src/**/*.{test,spec}.{js,ts,jsx,tsx}",
      "src/tests/**/*.test.{ts,tsx}",
    ],

    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});