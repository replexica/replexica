import { Gitlab } from "@gitbeaker/rest";
import Z from "zod";
import { PlatformKit } from "./_base.js";

const gl = new Gitlab({ token: "" });

export class GitlabPlatformKit extends PlatformKit {
  private _gitlab?: InstanceType<typeof Gitlab>;

  constructor() {
    super();

    // change direcotry to current repository before executing replexica
    process.chdir(this.platformConfig.repositoryDir);
  }

  get gitlab() {
    if (!this._gitlab) {
      this._gitlab = new Gitlab({
        token: this.platformConfig.glToken || "",
      });
    }
    return this._gitlab;
  }

  get platformConfig() {
    const env = Z.object({
      GL_TOKEN: Z.string().optional(),
      CI_COMMIT_BRANCH: Z.string(), // CI_DEFAULT_BRANCH ?
      CI_PROJECT_PATH_SLUG: Z.string(),
      CI_PROJECT_NAME: Z.string(),
      CI_PROJECT_ID: Z.string(),
      CI_PROJECT_DIR: Z.string(),
      CI_REPOSITORY_URL: Z.string(),
    }).parse(process.env);

    console.log(">> CI_PROJECT_PATH", process.env.CI_PROJECT_PATH);
    console.log(">> CI_PROJECT_URL", process.env.CI_PROJECT_URL);
    console.log(">> CI_COMMIT_BRANCH", process.env.CI_COMMIT_BRANCH);
    console.log(">> CI_PROJECT_DIR", process.env.CI_PROJECT_DIR);
    console.log(">> CI_REPOSITORY_URL", process.env.CI_REPOSITORY_URL);
    console.log(">> CI_PROJECT_ID", process.env.CI_PROJECT_ID);
    console.log(">> CI_PROJECT_NAMESPACE", process.env.CI_PROJECT_NAMESPACE);
    console.log(
      ">> CI_PROJECT_NAMESPACE_ID",
      process.env.CI_PROJECT_NAMESPACE_ID,
    );
    console.log(">> CI_PROJECT_PATH_SLUG", process.env.CI_PROJECT_PATH_SLUG);

    const config = {
      glToken: env.GL_TOKEN,
      baseBranchName: env.CI_COMMIT_BRANCH,
      repositoryOwner: env.CI_PROJECT_PATH_SLUG,
      repositoryName: env.CI_PROJECT_NAME,
      gitlabProjectId: env.CI_PROJECT_ID,
      repoUrl: env.CI_REPOSITORY_URL,
      repositoryDir: env.CI_PROJECT_DIR,
    };

    console.log(">> config", config);

    return config;
  }

  async branchExists({ branch }: { branch: string }): Promise<boolean> {
    try {
      await this.gitlab.Branches.show(
        this.platformConfig.gitlabProjectId,
        branch,
      );
      return true;
    } catch {
      return false;
    }
  }

  async getOpenPullRequestNumber({
    branch,
  }: {
    branch: string;
  }): Promise<number | undefined> {
    const mergeRequests = await this.gitlab.MergeRequests.all({
      projectId: this.platformConfig.gitlabProjectId,
      sourceBranch: branch,
      state: "opened",
    });
    return mergeRequests[0]?.iid;
  }

  async closePullRequest({
    pullRequestNumber,
  }: {
    pullRequestNumber: number;
  }): Promise<void> {
    await this.gitlab.MergeRequests.edit(
      this.platformConfig.gitlabProjectId,
      pullRequestNumber,
      { stateEvent: "close" },
    );
  }

  async createPullRequest({
    head,
    title,
    body,
  }: {
    head: string;
    title: string;
    body?: string;
  }): Promise<number> {
    const mr = await this.gitlab.MergeRequests.create(
      this.platformConfig.gitlabProjectId,
      head,
      this.platformConfig.baseBranchName,
      title,
      {
        description: body,
      },
    );
    return mr.iid;
  }

  async commentOnPullRequest({
    pullRequestNumber,
    body,
  }: {
    pullRequestNumber: number;
    body: string;
  }): Promise<void> {
    await this.gitlab.MergeRequestNotes.create(
      this.platformConfig.gitlabProjectId,
      pullRequestNumber,
      body,
    );
  }

  buildPullRequestUrl(pullRequestNumber: number): string {
    return `https://gitlab.com/${this.platformConfig.repositoryOwner}/${this.platformConfig.repositoryName}/-/merge_requests/${pullRequestNumber}`;
  }
}
