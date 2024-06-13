import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  target: "esnext",
  entry: {
    'compiler': 'src/compiler.ts',
    'react': 'src/react.ts',
    'react-next': 'src/react-next.ts',
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
