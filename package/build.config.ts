import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  rollup: {
    output: {
      exports: 'named',
    }
  },
  name: 'replexica',
  outDir: "build",
  externals: [
    '@replexica/react',
    '@replexica/compiler',
  ],
});
