import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  target: "esnext",
  entry: {
    'client': './src/client/index.ts',
    'next': './src/next/index.ts',
  },
  outDir: "build",
  format: ["cjs", "esm"],
  dts: true,
  external: ['react'],
  outExtension: (ctx) => ({
    js: ctx.format === "cjs" ? ".cjs" : ".mjs",
  }),
});