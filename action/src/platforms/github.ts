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

  async branchExists({ branch }: { branch: string }) {
    return await this.octokit.rest.repos
      .getBranch({
        branch,
        owner: this.platformConfig.repositoryOwner,
        repo: this.platformConfig.repositoryName,
      })
      .then((r) => r.data)
      .then((v) => !!v)
      .catch((r) => (r.status === 404 ? false : Promise.reject(r)));
  }

  async getOpenPullRequestNumber({ branch }: { branch: string }) {
    return await this.octokit.rest.pulls
      .list({
        head: `${this.platformConfig.repositoryOwner}:${branch}`,
        owner: this.platformConfig.repositoryOwner,
        repo: this.platformConfig.repositoryName,
        base: this.platformConfig.baseBranchName,
        state: "open",
      })
      .then(({ data }) => data[0])
      .then((pr) => pr?.number);
  }

  async closePullRequest({ pullRequestNumber }: { pullRequestNumber: number }) {
    await this.octokit.rest.pulls.update({
      pull_number: pullRequestNumber,
      owner: this.platformConfig.repositoryOwner,
      repo: this.platformConfig.repositoryName,
      state: "closed",
    });
  }

  async createPullRequest({
    head,
    title,
    body,
  }: {
    head: string;
    title: string;
    body?: string;
  }) {
    return await this.octokit.rest.pulls
      .create({
        head,
        title,
        body,
        owner: this.platformConfig.repositoryOwner,
        repo: this.platformConfig.repositoryName,
        base: this.platformConfig.baseBranchName,
      })
      .then(({ data }) => data.number);
  }

  async commentOnPullRequest({
    pullRequestNumber,
    body,
  }: {
    pullRequestNumber: number;
    body: string;
  }) {
    await this.octokit.rest.issues.createComment({
      issue_number: pullRequestNumber,
      body,
      owner: this.platformConfig.repositoryOwner,
      repo: this.platformConfig.repositoryName,
    });
  }

  get platformConfig() {
    const env = Z.object({
      GITHUB_REPOSITORY: Z.string(),
      GITHUB_REPOSITORY_OWNER: Z.string(),
      GITHUB_REF_NAME: Z.string(),
      GH_TOKEN: Z.string().optional(),
    }).parse(process.env);

    return {
      ghToken: env.GH_TOKEN,
      baseBranchName: env.GITHUB_REF_NAME,
      repositoryOwner: env.GITHUB_REPOSITORY_OWNER,
      repositoryName: env.GITHUB_REPOSITORY.split("/")[1],
    };
  }

  buildPullRequestUrl(pullRequestNumber: number) {
    const { repositoryOwner, repositoryName } = this.platformConfig;
    return `https://github.com/${repositoryOwner}/${repositoryName}/pull/${pullRequestNumber}`;
  }
}
