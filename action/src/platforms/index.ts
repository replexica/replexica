import { BitbucketPlatformKit } from "./bitbucket.js";
import { GitHubPlatformKit } from "./github.js";
import { GitlabPlatformKit } from "./gitlab.js";

export const getPlatformKit = () => {
  if (process.env.BITBUCKET_PIPELINE_UUID) {
    return new BitbucketPlatformKit();
  }

  if (process.env.GITHUB_ACTION) {
    return new GitHubPlatformKit();
  }

  if (process.env.GITLAB_CI) {
    return new GitlabPlatformKit();
  }

  throw new Error("This platform is not supported");
};
