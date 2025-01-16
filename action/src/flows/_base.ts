import { Ora } from "ora";
import { PlatformKit } from "../platforms/_base.js";

export interface IIntegrationFlow {
  preRun?(): Promise<boolean>;
  run(): Promise<boolean>;
  postRun?(): Promise<void>;
}

export abstract class IntegrationFlow implements IIntegrationFlow {
  protected i18nBranchName?: string;

  constructor(
    protected ora: Ora,
    protected platformKit: PlatformKit,
  ) {}

  abstract run(): Promise<boolean>;
}

export const gitConfig = {
  userName: "Replexica",
  userEmail: "support@replexica.com",
};
