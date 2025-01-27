import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  target: "node18",
  entry: {
    cli: "src/cli.ts",
    sdk: "src/sdk.ts",
    spec: "src/spec.ts",
  },
  outDir: "build",
  format: ["cjs", "esm"],
  external: [],
  dts: true,
  cjsInterop: true,
  splitting: true,
  outExtension: (ctx) => ({
    js: ctx.format === "cjs" ? ".cjs" : ".mjs",
  }),
});
