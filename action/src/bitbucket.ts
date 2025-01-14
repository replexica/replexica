import { execSync } from "child_process";
import createOra from "ora";
import bbLib from "bitbucket";

import { IIntegrationFlow } from "./flows/_base.js";
import { PullRequestFlow } from "./flows/pull-request.js";
import { InBranchFlow } from "./flows/in-branch.js";
import Z from "zod";
import loadOctokit from "./instances/octokit.js";

const { Bitbucket } = bbLib;

async function loadEnv() {
  return Z.object({
    // Replexica
    REPLEXICA_API_KEY: Z.string(),
    REPLEXICA_PULL_REQUEST: Z.preprocess(
      (val) => val === "true" || val === true,
      Z.boolean(),
    ),
    REPLEXICA_COMMIT_MESSAGE: Z.string(),
    REPLEXICA_PULL_REQUEST_TITLE: Z.string(),
    // Bitbucket
    BITBUCKET_BRANCH: Z.string(),
    BITBUCKET_REPO_FULL_NAME: Z.string(),
    // Custom env
    GH_TOKEN: Z.string().optional(),
    BB_TOKEN: Z.string().optional(),
  }).parse(process.env);
}

(async function main() {
  const ora = createOra();
  const env = await loadEnv();

  const repositoryFullName = env.BITBUCKET_REPO_FULL_NAME;
  const [repositoryOwner, repositoryName] = repositoryFullName.split("/");

  const config = {
    replexicaApiKey: env.REPLEXICA_API_KEY,
    isPullRequestMode: env.REPLEXICA_PULL_REQUEST,
    commitMessage: env.REPLEXICA_COMMIT_MESSAGE,
    pullRequestTitle: env.REPLEXICA_PULL_REQUEST_TITLE,
    baseBranchName: env.BITBUCKET_BRANCH,
    repositoryFullName,
    repositoryOwner,
    repositoryName,
  };

  const bb = new Bitbucket({
    auth: { token: env.BB_TOKEN || "" },
  });

  const bitbucketKit: Awaited<ReturnType<typeof loadOctokit>> = {
    branchExists: async ({ owner, repo, branch }) => {
      const result = await bb.repositories.getBranch({
        workspace: owner,
        repo_slug: repo,
        name: branch,
      });
      return !!result;
    },
    getOpenPullRequestNumber: async ({ owner, repo, head, base }) => {
      const pr = await bb.repositories
        .listPullRequests({
          workspace: owner,
          repo_slug: repo,
          state: "OPEN",
          // TODO: head, base ???
        })
        .then(({ data: { values } }) => values?.[0]);
      return pr?.id;
    },
    closePullRequest: async ({ owner, repo, pull_number }) => {
      await bb.repositories.declinePullRequest({
        workspace: owner,
        repo_slug: repo,
        pull_request_id: pull_number,
      });
    },
    createPullRequest: async ({ owner, repo, title, body, head, base }) => {
      const pr = await bb.repositories.createPullRequest({
        workspace: owner,
        repo_slug: repo,
        _body: {
          title,
          summary: {
            markup: "markdown",
            raw: body,
          },
          fromRef: { id: head },
          toRef: { id: base },
        } as any,
      });
      return pr?.data?.id;
    },
    commentOnPullRequest: async ({ owner, repo, issue_number, body }) => {
      await bb.repositories.createPullRequestComment({
        workspace: owner,
        repo_slug: repo,
        pull_request_id: issue_number,
        _body: {
          content: {
            markup: "markdown",
            raw: body,
          },
        } as any,
      });
    },
    preCommit: () => {
      // https://community.atlassian.com/t5/Bitbucket-questions/Bitbucket-Pipe-push-back-to-repo/qaq-p/1096417
      execSync(
        "git config http.${BITBUCKET_GIT_HTTP_ORIGIN}.proxy http://host.docker.internal:29418/",
      );
    },
  };

  // TODO: enable PR flow when ready
  if (config.isPullRequestMode) {
    ora.info("Pull request mode not supported yet in BitBucket pipe.");
    return;
  }

  ora.info(`Pull request mode: ${config.isPullRequestMode ? "on" : "off"}`);

  const flow: IIntegrationFlow = config.isPullRequestMode
    ? new PullRequestFlow(ora, bitbucketKit, config)
    : new InBranchFlow(ora, bitbucketKit, config);

  await flow.preRun?.();
  const hasChanges = await flow.run();
  if (hasChanges) {
    await flow.postRun?.();
  }
})();
