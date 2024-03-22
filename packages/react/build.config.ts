import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  outDir: "build",
  externals: ["react"],
});
