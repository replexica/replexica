import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  target: "esnext",
  entry: {
    client: "./src/client/index.ts",
    next: "./src/next/index.ts",
  },
  outDir: "build",
  format: ["cjs", "esm"],
  external: ["react"],
  dts: true,
  cjsInterop: true,
  splitting: true,
  outExtension: (ctx) => ({
    js: ctx.format === "cjs" ? ".cjs" : ".mjs",
  }),
});
