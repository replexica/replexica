import Z from "zod";

interface BasePlatformConfig {
  baseBranchName: string;
  repositoryOwner: string;
  repositoryName: string;
}

export abstract class PlatformKit<
  PlatformConfig extends BasePlatformConfig = BasePlatformConfig,
> {
  abstract branchExists(props: { branch: string }): Promise<boolean>;

  abstract getOpenPullRequestNumber(props: {
    branch: string;
  }): Promise<number | undefined>;

  abstract closePullRequest(props: {
    pullRequestNumber: number;
  }): Promise<void>;

  abstract createPullRequest(props: {
    head: string;
    title: string;
    body?: string;
  }): Promise<number>;

  abstract commentOnPullRequest(props: {
    pullRequestNumber: number;
    body: string;
  }): Promise<void>;

  abstract get platformConfig(): PlatformConfig;

  abstract buildPullRequestUrl(pullRequestNumber: number): string;

  gitConfig(): Promise<void> | void {}

  get config() {
    const env = Z.object({
      REPLEXICA_API_KEY: Z.string(),
      REPLEXICA_PULL_REQUEST: Z.preprocess(
        (val) => val === "true" || val === true,
        Z.boolean(),
      ),
      REPLEXICA_COMMIT_MESSAGE: Z.string(),
      REPLEXICA_PULL_REQUEST_TITLE: Z.string(),
    }).parse(process.env);

    return {
      replexicaApiKey: env.REPLEXICA_API_KEY,
      isPullRequestMode: env.REPLEXICA_PULL_REQUEST,
      commitMessage: env.REPLEXICA_COMMIT_MESSAGE,
      pullRequestTitle: env.REPLEXICA_PULL_REQUEST_TITLE,
    };
  }
}

export interface IConfig {
  replexicaApiKey: string;
  isPullRequestMode: boolean;
  commitMessage: string;
  pullRequestTitle: string;
}
