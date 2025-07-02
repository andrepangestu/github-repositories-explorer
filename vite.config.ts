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
    // Better error reporting for CI
    reporters: process.env.CI ? ["verbose"] : ["default"],
    // Disable file watching in CI
    watch: !process.env.CI,
    // Retry flaky tests in CI
    retry: process.env.CI ? 2 : 0,
    // Memory management for CI
    maxConcurrency: process.env.CI ? 1 : 5,
    // Ensure tests run sequentially in CI to avoid memory issues
    pool: process.env.CI ? "forks" : "threads",
    // Clean up between tests
    restoreMocks: true,
    clearMocks: true,
  },
});
