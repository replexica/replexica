import { Octokit } from "octokit";
import { PlatformKit } from "./_base.js";
import Z from "zod";

export class GitHubPlatformKit extends PlatformKit {
  private _octokit?: Octokit;

  get octokit() {
    if (!this._octokit) {
      this._octokit = new Octokit({ auth: this.platformConfig.ghToken });
    }
    return this._octokit;
  }

  async branchExists(props: { branch: string; }) {
    return await this.octokit.rest.repos
      .getBranch({
        ...props,
        owner: this.platformConfig.repositoryOwner,
        repo: this.platformConfig.repositoryName,
      })
      .then((r) => r.data)
      .then((v) => !!v)
      .catch((r) => (r.status === 404 ? false : Promise.reject(r)));
  }

  async getOpenPullRequestNumber(props: { head: string; }) {
    const pr = await this.octokit.rest.pulls
      .list({
        ...props,
        owner: this.platformConfig.repositoryOwner,
        repo: this.platformConfig.repositoryName,
        base: this.platformConfig.baseBranchName,
        state: "open",
      })
      .then(({ data }) => data[0]);
    return pr?.number;
  }

  async closePullRequest(props: { pull_number: number; }) {
    await this.octokit.rest.pulls.update({
      ...props,
      owner: this.platformConfig.repositoryOwner,
      repo: this.platformConfig.repositoryName,
      state: "closed",
    });
  }

  async createPullRequest(props: {
    owner: string;
    repo: string;
    head: string;
    base: string;
    title: string;
    body?: string;
  }): Promise<number | undefined> {
    const pr = await this.octokit.rest.pulls.create(props);
    return pr.data.number;
  }

  async commentOnPullRequest(props: {
    issue_number: number;
    body: string;
  }) {
    await this.octokit.rest.issues.createComment({
      ...props,
      owner: this.platformConfig.repositoryOwner,
      repo: this.platformConfig.repositoryName,
    });
  }

  async preCommit(): Promise<void> {}

  get platformConfig() {
    const env = Z.object({
      GITHUB_REPOSITORY: Z.string(),
      GITHUB_REPOSITORY_OWNER: Z.string(),
      GITHUB_REF: Z.string(),
      GITHUB_REF_NAME: Z.string(),
      GITHUB_HEAD_REF: Z.string(),
      GH_TOKEN: Z.string().optional(),
    }).parse(process.env);

    return {
      ghToken: env.GH_TOKEN,
      baseBranchName: env.GITHUB_REF_NAME,
      repositoryOwner: env.GITHUB_REPOSITORY_OWNER,
      repositoryFullName: env.GITHUB_REPOSITORY,
      repositoryName: env.GITHUB_REPOSITORY.split("/")[1],
    };
  }
}
