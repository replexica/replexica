import { Gitlab } from "@gitbeaker/rest";
import Z from "zod";
import { PlatformKit } from "./_base.js";
import { execSync } from "child_process";

const gl = new Gitlab({ token: "" });

export class GitlabPlatformKit extends PlatformKit {
  private _gitlab?: InstanceType<typeof Gitlab>;

  constructor() {
    super();

    // change directory to current repository before executing replexica
    process.chdir(this.platformConfig.projectDir);
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
      CI_COMMIT_BRANCH: Z.string(),
      CI_MERGE_REQUEST_SOURCE_BRANCH_NAME: Z.string().optional(),
      CI_PROJECT_NAMESPACE: Z.string(),
      CI_PROJECT_NAME: Z.string(),
      CI_PROJECT_ID: Z.string(),
      CI_PROJECT_DIR: Z.string(),
      CI_REPOSITORY_URL: Z.string(),
    }).parse(process.env);

    const config = {
      glToken: env.GL_TOKEN,
      baseBranchName:
        env.CI_MERGE_REQUEST_SOURCE_BRANCH_NAME ?? env.CI_COMMIT_BRANCH,
      repositoryOwner: env.CI_PROJECT_NAMESPACE,
      repositoryName: env.CI_PROJECT_NAME,
      gitlabProjectId: env.CI_PROJECT_ID,
      projectDir: env.CI_PROJECT_DIR,
      reporitoryUrl: env.CI_REPOSITORY_URL,
    };

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

  gitConfig(): Promise<void> | void {
    const url = `https://gitlab-ci-token:${this.platformConfig.glToken}@gitlab.com/${this.platformConfig.repositoryOwner}/${this.platformConfig.repositoryName}.git`;
    execSync(`git remote set-url origin ${url}`, {
      stdio: "inherit",
    });
    execSync(`git checkout -b ${this.platformConfig.baseBranchName}`, {
      stdio: "inherit",
    });
  }

  buildPullRequestUrl(pullRequestNumber: number): string {
    return `https://gitlab.com/${this.platformConfig.repositoryOwner}/${this.platformConfig.repositoryName}/-/merge_requests/${pullRequestNumber}`;
  }
}
