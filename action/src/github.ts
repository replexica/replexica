import { entrypoint } from "./_base.js";
import { GitHubPlatformKit } from "./platforms/github.js";

(async function main() {
  const githubKit = new GitHubPlatformKit();
  await entrypoint(githubKit);
})();
