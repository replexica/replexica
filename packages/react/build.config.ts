import { BuildEntry, MkdistBuildEntry, defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    ...dualOutput({
      input: "./src",
      outDir: "./build",
    }),
  ],
  outDir: "build",
  declaration: 'compatible',
  externals: ['next', 'react'],
});

function dualOutput(
  config: Omit<MkdistBuildEntry, "builder" | "format">
): BuildEntry[] {
  return [
    {
      builder: "mkdist",
      format: "esm",
      ext: 'mjs',
      ...config,
    },
    {
      builder: "mkdist",
      format: "cjs",
      ext: 'cjs',
      ...config,
    },
  ];
}