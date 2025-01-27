import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  target: "esnext",
  entry: {
    cli: "src/cli.ts",
    sdk: "src/sdk.ts",
    spec: "src/spec.ts",
  },
  outDir: "build",
  format: ["cjs", "esm"],
  dts: true,
  cjsInterop: true,
  splitting: true,
  external: ["readline/promises"],
  noExternal: ["@lingo.dev/cli", "@lingo.dev/sdk", "@lingo.dev/spec"],
  outExtension: (ctx) => ({
    js: ctx.format === "cjs" ? ".cjs" : ".mjs",
  }),
});
