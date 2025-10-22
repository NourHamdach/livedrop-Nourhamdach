// apps/api/vitest.config.js
import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["./tests/test-setup.js"],
    testTimeout: 60000,
    env: { NODE_ENV: "test" },
    threads: false,       // Run tests sequentially (MongoDB conflicts avoided)
    isolate: false,       // Share environment for test setup + seeding
    sequence: { concurrent: false }, // ✅ ensures sequential seeding
    watch: false,
    reporters: ["default"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["tests/**"],
    },
  },
});
