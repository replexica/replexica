import { execSync } from "child_process";
import { entrypoint } from "./_base.js";
import { GitlabPlatformKit } from "./platforms/gitlab.js";

(async function main() {
  const gitlabKit = new GitlabPlatformKit();
  // await entrypoint(gitlabKit);
})();
