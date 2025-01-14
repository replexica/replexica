import { Command } from "commander";
import Ora from "ora";
import { getConfig, saveConfig } from "../utils/config";
import { defaultConfig } from "@replexica/spec";

export default new Command()
  .command("init")
  .description("Initialize Replexica project")
  .helpOption("-h, --help", "Show help")
  .action(async (options) => {
    const spinner = Ora().start("Initializing Replexica project");

    let config = await getConfig(false);
    if (config) {
      spinner.fail("Replexica project already initialized");
      return process.exit(1);
    }

    await saveConfig(defaultConfig);

    spinner.succeed("Replexica project initialized");
  });
