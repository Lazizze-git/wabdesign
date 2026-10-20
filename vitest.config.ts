import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    env: { OUTIL_DESIGN_CONFIG_DIR: join(tmpdir(), "outil-design-tests") },
  },
});
