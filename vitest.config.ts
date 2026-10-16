import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    globalSetup: ["./tests/global-setup.ts"],
    // Relative to prisma/schema.prisma; kept apart from the dev database.
    env: { DATABASE_URL: "file:./test.db" },
    // Tests share one SQLite file, so run files one at a time.
    fileParallelism: false,
  },
});
