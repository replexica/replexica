import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: ['./src/index.ts'],
  outDir: "build",
  external: ['readline'],
  format: ['esm',],
});
