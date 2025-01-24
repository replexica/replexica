#!/usr/bin/env node
import dotenv from "dotenv";
dotenv.config();

import { InteractiveCommand } from "interactive-commander";

import authCmd from "./auth";
import initCmd from "./init";
import configCmd from "./show";
import i18nCmd from "./i18n";
import lockfileCmd from "./lockfile";
import cleanupCmd from "./cleanup";

import packageJson from "../../package.json";

export default new InteractiveCommand()
  .name("replexica")
  .description("Replexica CLI")
  .helpOption("-h, --help", "Show help")
  .addHelpText(
    "beforeAll",
    `
 ____            _           _           
|  _ \\ ___ _ __ | | _____  _(_) ___ __ _ 
| |_) / _ \\ '_ \\| |/ _ \\ \\/ / |/ __/ _\` |
|  _ <  __/ |_) | |  __/>  <| | (_| (_| |
|_| \\_\\___| .__/|_|\\___/_/\\_\\_|\\___\\__,_|
          |_|                            

Website: https://replexica.com
`,
  )
  .version(`v${packageJson.version}`, "-v, --version", "Show version")
  .addCommand(initCmd)
  .interactive("-y, --no-interactive", "Disable interactive mode") // all interactive commands above
  .addCommand(i18nCmd)
  .addCommand(authCmd)
  .addCommand(configCmd)
  .addCommand(lockfileCmd)
  .addCommand(cleanupCmd)
  .parseAsync(process.argv);
