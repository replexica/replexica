import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: {
    cli: "src/cli/index.ts",
    sdk: "src/sdk/index.ts",
    spec: "src/spec/index.ts",
  },
  outDir: "build",
  format: ["cjs", "esm"],
  dts: true,
  cjsInterop: true,
  splitting: true,
  bundle: true,
  sourcemap: true,
  external: ["readline/promises"],
  outExtension: (ctx) => ({
    js: ctx.format === "cjs" ? ".cjs" : ".mjs",
  }),
});
