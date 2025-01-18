import createOra from "ora";

import { IIntegrationFlow } from "./flows/_base.js";
import { PullRequestFlow } from "./flows/pull-request.js";
import { InBranchFlow } from "./flows/in-branch.js";
import { getPlatformKit } from "./platforms/index.js";

(async function main() {
  const ora = createOra();
  const platformKit = getPlatformKit();
  const { isPullRequestMode } = platformKit.config;

  ora.info(`Pull request mode: ${isPullRequestMode ? "on" : "off"}`);

  const flow: IIntegrationFlow = isPullRequestMode
    ? new PullRequestFlow(ora, platformKit)
    : new InBranchFlow(ora, platformKit);

  const canRun = await flow.preRun?.();
  if (canRun === false) {
    return;
  }

  const hasChanges = await flow.run();
  if (!hasChanges) {
    return;
  }

  await flow.postRun?.();
})();
