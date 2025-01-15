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
    head: string;
  }): Promise<number | undefined>;

  abstract closePullRequest(props: { pull_number: number }): Promise<void>;

  abstract createPullRequest(props: {
    head: string;
    title: string;
    body?: string;
  }): Promise<number | undefined>;

  abstract commentOnPullRequest(props: {
    issue_number: number;
    body: string;
  }): Promise<void>;

  abstract preCommit(): Promise<void>;

  abstract get platformConfig(): PlatformConfig;

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
