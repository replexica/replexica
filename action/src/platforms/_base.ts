import Z from "zod";

const defaultMessage = "feat: update translations via @lingodotdev";

interface BasePlatformConfig {
  baseBranchName: string;
  repositoryOwner: string;
  repositoryName: string;
}

export abstract class PlatformKit<PlatformConfig extends BasePlatformConfig = BasePlatformConfig> {
  abstract branchExists(props: { branch: string }): Promise<boolean>;

  abstract getOpenPullRequestNumber(props: { branch: string }): Promise<number | undefined>;

  abstract closePullRequest(props: { pullRequestNumber: number }): Promise<void>;

  abstract createPullRequest(props: { head: string; title: string; body?: string }): Promise<number>;

  abstract commentOnPullRequest(props: { pullRequestNumber: number; body: string }): Promise<void>;

  abstract get platformConfig(): PlatformConfig;

  abstract buildPullRequestUrl(pullRequestNumber: number): string;

  gitConfig(): Promise<void> | void {}

  get config() {
    const env = Z.object({
      LINGODOTDEV_API_KEY: Z.string(),
      LINGODOTDEV_PULL_REQUEST: Z.preprocess((val) => val === "true" || val === true, Z.boolean()),
      LINGODOTDEV_COMMIT_MESSAGE: Z.string().optional(),
      LINGODOTDEV_PULL_REQUEST_TITLE: Z.string().optional(),
      LINGODOTDEV_WORKING_DIRECTORY: Z.string().optional(),
    }).parse(process.env);

    return {
      replexicaApiKey: env.LINGODOTDEV_API_KEY,
      isPullRequestMode: env.LINGODOTDEV_PULL_REQUEST,
      commitMessage: env.LINGODOTDEV_COMMIT_MESSAGE || defaultMessage,
      pullRequestTitle: env.LINGODOTDEV_PULL_REQUEST_TITLE || defaultMessage,
      workingDir: env.LINGODOTDEV_WORKING_DIRECTORY || ".",
    };
  }
}

export interface IConfig {
  replexicaApiKey: string;
  isPullRequestMode: boolean;
  commitMessage: string;
  pullRequestTitle: string;
}
