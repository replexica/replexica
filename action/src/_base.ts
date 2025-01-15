import createOra from "ora";

import { IIntegrationFlow } from "./flows/_base.js";
import { PullRequestFlow } from "./flows/pull-request.js";
import { InBranchFlow } from "./flows/in-branch.js";
import { PlatformKit } from "./platforms/_base.js";

export async function entrypoint(platformKit: PlatformKit) {
  const ora = createOra();
  const { isPullRequestMode } = platformKit.config;

  ora.info(`Pull request mode: ${isPullRequestMode ? "on" : "off"}`);

  const flow: IIntegrationFlow = isPullRequestMode
    ? new PullRequestFlow(ora, platformKit)
    : new InBranchFlow(ora, platformKit);

  await flow.preRun?.();
  const hasChanges = await flow.run();
  if (hasChanges) {
    await flow.postRun?.();
  }
}
