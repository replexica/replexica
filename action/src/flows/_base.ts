import { Ora } from "ora";
import { PlatformKit } from "../platforms/_base.js";

export interface IIntegrationFlow {
  preRun?(): Promise<void>;
  run(): Promise<boolean>;
  postRun?(): Promise<void>;
}

export abstract class IntegrationFlow implements IIntegrationFlow {
  constructor(
    protected ora: Ora,
    protected platformKit: PlatformKit,
  ) {}

  abstract run(): Promise<boolean>;
}
