import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  outDir: "build",
  externals: ['webpack', 'next'],
});
