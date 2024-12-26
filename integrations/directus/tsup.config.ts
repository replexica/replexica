import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  target: "esnext",
  entry: [
    "src/api.ts",
    "src/app.ts",
  ],
  outDir: "build",
  format: ["cjs", "esm"],
  cjsInterop: true,
  splitting: true,
  external: ["@replexica/sdk"],
  outExtension: (ctx) => ({
    js: ctx.format === "cjs" ? ".cjs" : ".mjs",
  }),
});
