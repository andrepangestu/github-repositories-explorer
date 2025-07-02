/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/github-repositories-explorer/",
  server: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    reporters: process.env.CI ? ["verbose"] : ["default"],
    watch: !process.env.CI,
    retry: process.env.CI ? 2 : 0,
    maxConcurrency: process.env.CI ? 1 : 5,
    pool: process.env.CI ? "forks" : "threads",
    restoreMocks: true,
    clearMocks: true,
  },
});
