import dotenv from "dotenv";
dotenv.config();

import { InteractiveCommand } from "interactive-commander";
import figlet from "figlet";
import { vice } from "gradient-string";

import authCmd from "./cli/auth";
import initCmd from "./cli/init";
import configCmd from "./cli/show";
import i18nCmd from "./cli/i18n";
import lockfileCmd from "./cli/lockfile";
import cleanupCmd from "./cli/cleanup";

import packageJson from "../../package.json";

export default new InteractiveCommand()
  .name("lingo.dev")
  .description("Lingo.dev CLI")
  .helpOption("-h, --help", "Show help")
  .addHelpText(
    "beforeAll",
    `
${vice(
  figlet.textSync("LINGO.DEV", {
    font: "ANSI Shadow",
    horizontalLayout: "default",
    verticalLayout: "default",
  }),
)}

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
  .addCommand(cleanupCmd)
  .exitOverride((err) => {
    // Exit with code 0 when help or version is displayed
    if (err.code === "commander.helpDisplayed" || err.code === "commander.version" || err.code === "commander.help") {
      process.exit(0);
    }
    throw err;
  });
