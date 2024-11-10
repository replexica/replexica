import createOra from 'ora';

import loadConfig from './instances/config.js';
import loadOctokit from './instances/octokit.js';
import { IIntegrationFlow } from './flows/_base.js';
import { PullRequestFlow } from './flows/pull-request.js';
import { InBranchFlow } from './flows/in-branch.js';

(async function main() {
  const ora = createOra();
  const octokit = await loadOctokit();
  const config = await loadConfig();

  ora.info(`Pull request mode: ${config.isPullRequestMode ? 'on' : 'off'}`);

  const flow: IIntegrationFlow = config.isPullRequestMode
    ? new PullRequestFlow(ora, octokit, config)
    : new InBranchFlow(ora, octokit, config);

  await flow.preRun?.();
  const hasChanges = await flow.run();
  if (hasChanges) {
    await flow.postRun?.();
  }

})();
