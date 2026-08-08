import { defineConfig } from "tsup";

export default defineConfig({
  // Only the real product ships. models.ts and testrun.ts are development
  // helpers — useful to us, noise to anyone who installs this.
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  outDir: "dist",
  clean: true,
  // Keeps the shebang (#!/usr/bin/env node) so the CLI is executable.
  banner: {},
  splitting: false,
  sourcemap: false,
  // Dependencies stay external — npm installs them alongside us.
  external: ["@google/genai", "dotenv"],
});
