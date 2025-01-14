import loadEnv from "./_env.js";
import { Octokit } from "octokit";

export default async function loadOctokit() {
  const env = await loadEnv();
  const octokit = new Octokit({ auth: env.GH_TOKEN });

  return {
    branchExists: async (props: {
      owner: string;
      repo: string;
      branch: string;
    }): Promise<boolean> =>
      !!(await octokit.rest.repos
        .getBranch(props)
        .then((r) => r.data)
        .catch((r) => (r.status === 404 ? false : Promise.reject(r)))),
    getOpenPullRequestNumber: async (props: {
      owner: string;
      repo: string;
      head: string;
      base: string;
    }): Promise<number | undefined> => {
      const pr = await octokit.rest.pulls
        .list({
          ...props,
          state: "open",
        })
        .then(({ data }) => data[0]);
      return pr?.number;
    },
    closePullRequest: async (props: {
      owner: string;
      repo: string;
      pull_number: number;
    }): Promise<void> => {
      await octokit.rest.pulls.update({
        ...props,
        state: "closed",
      });
    },
    createPullRequest: async (props: any): Promise<number | undefined> => {
      const pr = await octokit.rest.pulls.create(props);
      return pr.data.number;
    },
    commentOnPullRequest: async (props: any): Promise<void> => {
      await octokit.rest.issues.createComment(props);
    },
    preCommit: () => {},
  };
}
