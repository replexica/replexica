import { execSync } from "child_process";
import bbLib from "bitbucket";
import Z from "zod";
import { PlatformKit } from "./_base.js";

const { Bitbucket } = bbLib;

interface BitbucketConfig {
  baseBranchName: string;
  repositoryOwner: string;
  repositoryName: string;
  bbToken?: string;
}

export class BitbucketPlatformKit extends PlatformKit<BitbucketConfig> {
  private _bb?: ReturnType<typeof Bitbucket>;

  get bb() {
    if (!this._bb) {
      this._bb = new Bitbucket({
        auth: { token: this.platformConfig.bbToken || "" },
      });
    }
    return this._bb;
  }

  async branchExists({ branch }: { branch: string }) {
    return await this.bb.repositories
      .getBranch({
        workspace: this.platformConfig.repositoryOwner,
        repo_slug: this.platformConfig.repositoryName,
        name: branch,
      })
      .then((r) => r.data)
      .then((v) => !!v)
      .catch((r) => (r.status === 404 ? false : Promise.reject(r)));
  }

  async getOpenPullRequestNumber({ branch }: { branch: string }) {
    return await this.bb.repositories
      .listPullRequests({
        workspace: this.platformConfig.repositoryOwner,
        repo_slug: this.platformConfig.repositoryName,
        state: "OPEN",
      })
      .then(({ data: { values } }) => {
        // TODO: we might need to handle pagination in future
        // bitbucket API does not support filtering pull requests
        // https://developer.atlassian.com/cloud/bitbucket/rest/api-group-pullrequests/#api-repositories-workspace-repo-slug-pullrequests-get
        return values?.find(
          ({ source, destination }) =>
            source?.branch?.name === branch && destination?.branch?.name === this.platformConfig.baseBranchName,
        );
      })
      .then((pr) => pr?.id);
  }

  async closePullRequest({ pullRequestNumber }: { pullRequestNumber: number }) {
    await this.bb.repositories.declinePullRequest({
      workspace: this.platformConfig.repositoryOwner,
      repo_slug: this.platformConfig.repositoryName,
      pull_request_id: pullRequestNumber,
    });
  }

  async createPullRequest({ title, body, head }: { title: string; body?: string; head: string }) {
    return await this.bb.repositories
      .createPullRequest({
        workspace: this.platformConfig.repositoryOwner,
        repo_slug: this.platformConfig.repositoryName,
        _body: {
          title,
          description: body,
          source: { branch: { name: head } },
          destination: { branch: { name: this.platformConfig.baseBranchName } },
        } as any,
      })
      .then(({ data }) => data.id ?? 0);
  }

  async commentOnPullRequest({ pullRequestNumber, body }: { pullRequestNumber: number; body: string }) {
    await this.bb.repositories.createPullRequestComment({
      workspace: this.platformConfig.repositoryOwner,
      repo_slug: this.platformConfig.repositoryName,
      pull_request_id: pullRequestNumber,
      _body: {
        content: {
          raw: body,
        },
      } as any,
    });
  }

  async gitConfig() {
    execSync("git config --unset http.${BITBUCKET_GIT_HTTP_ORIGIN}.proxy", {
      stdio: "inherit",
    });
    execSync("git config http.${BITBUCKET_GIT_HTTP_ORIGIN}.proxy http://host.docker.internal:29418/", {
      stdio: "inherit",
    });
  }

  get platformConfig() {
    const env = Z.object({
      BITBUCKET_BRANCH: Z.string(),
      BITBUCKET_REPO_FULL_NAME: Z.string(),
      BB_TOKEN: Z.string().optional(),
    }).parse(process.env);

    const [repositoryOwner, repositoryName] = env.BITBUCKET_REPO_FULL_NAME.split("/");

    return {
      baseBranchName: env.BITBUCKET_BRANCH,
      repositoryOwner,
      repositoryName,
      bbToken: env.BB_TOKEN,
    };
  }

  buildPullRequestUrl(pullRequestNumber: number) {
    const { repositoryOwner, repositoryName } = this.platformConfig;
    return `https://bitbucket.org/${repositoryOwner}/${repositoryName}/pull-requests/${pullRequestNumber}`;
  }
}
