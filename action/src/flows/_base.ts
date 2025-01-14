import { Ora } from "ora";
import loadOctokit from "../instances/octokit.js";
import loadConfig from "../instances/config.js";

export interface IIntegrationFlow {
  preRun?(): Promise<void>;
  run(): Promise<boolean>;
  postRun?(): Promise<void>;
}

export abstract class IntegrationFlow implements IIntegrationFlow {
  constructor(
    protected ora: Ora,
    protected octokit: Awaited<ReturnType<typeof loadOctokit>>,
    protected config: Awaited<ReturnType<typeof loadConfig>>,
  ) {}

  abstract run(): Promise<boolean>;
}
