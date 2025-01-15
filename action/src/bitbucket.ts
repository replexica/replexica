import { entrypoint } from "./_base.js";
import { BitbucketPlatformKit } from "./platforms/bitbucket.js";

(async function main() {
  const bitbucketKit = new BitbucketPlatformKit();
  await entrypoint(bitbucketKit);
})();
