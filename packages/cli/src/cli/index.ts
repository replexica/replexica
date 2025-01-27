import dotenv from "dotenv";
dotenv.config();

import { InteractiveCommand } from "interactive-commander";

import authCmd from "./cli/auth";
import initCmd from "./cli/init";
import configCmd from "./cli/show";
import i18nCmd from "./cli/i18n";
import lockfileCmd from "./cli/lockfile";
import cleanupCmd from "./cli/cleanup";

import packageJson from "../../package.json";

export default new InteractiveCommand()
  .name("replexica")
  .description("Replexica CLI")
  .helpOption("-h, --help", "Show help")
  .addHelpText(
    "beforeAll",
    `
Lingo.dev CLI
Website: https://lingo.dev
`,
  )
  .version(`v${packageJson.version}`, "-v, --version", "Show version")
  .addCommand(initCmd)
  .interactive("-y, --no-interactive", "Disable interactive mode") // all interactive commands above
  .addCommand(i18nCmd)
  .addCommand(authCmd)
  .addCommand(configCmd)
  .addCommand(lockfileCmd)
  .addCommand(cleanupCmd);
