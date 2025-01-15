import Z from "zod";

export abstract class PlatformKit {
  abstract branchExists(props: {
    branch: string;
  }): Promise<boolean>;

  abstract getOpenPullRequestNumber(props: {
    head: string;
  }): Promise<number | undefined>;

  abstract closePullRequest(props: {
    pull_number: number;
  }): Promise<void>;

  abstract createPullRequest(props: any): Promise<number | undefined>;

  abstract commentOnPullRequest(props: any): Promise<void>;

  abstract preCommit(): Promise<void>;

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
