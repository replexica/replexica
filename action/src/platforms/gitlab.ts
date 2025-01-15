import { Gitlab } from "@gitbeaker/rest";
import Z from "zod";
import { PlatformKit } from "./_base.js";

interface GitlabPlatformConfig {
  baseBranchName: string;
  repositoryOwner: string;
  repositoryName: string;
  gitlabProjectId: string;
}

export class GitlabPlatformKit extends PlatformKit<GitlabPlatformConfig> {
  private gitlab: Gitlab;

  constructor() {
    super();
    const token = process.env.GITLAB_TOKEN;
    if (!token) {
      throw new Error("GITLAB_TOKEN environment variable is required");
    }
    this.gitlab = new Gitlab({ token });
  }

  get platformConfig(): GitlabPlatformConfig {
    const env = Z.object({
      GITLAB_BASE_BRANCH: Z.string(),
      GITLAB_REPOSITORY_OWNER: Z.string(),
      GITLAB_REPOSITORY_NAME: Z.string(),
      GITLAB_PROJECT_ID: Z.string(),
    }).parse(process.env);

    return {
      baseBranchName: env.GITLAB_BASE_BRANCH,
      repositoryOwner: env.GITLAB_REPOSITORY_OWNER,
      repositoryName: env.GITLAB_REPOSITORY_NAME,
      gitlabProjectId: env.GITLAB_PROJECT_ID,
    };
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
