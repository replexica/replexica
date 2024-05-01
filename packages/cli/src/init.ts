import { Command } from "commander";
import Ora from 'ora';
import { createEmptyConfig, loadConfig, saveConfig } from "./services/config.js";

export default new Command()
  .command("init")
  .description("Initialize Replexica project")
  .helpOption("-h, --help", "Show help")
  .action(async (options) => {
    const spinner = Ora().start('Initializing Replexica project');

    let config = await loadConfig();
    if (config) {
      spinner.fail('Replexica project already initialized');
      return process.exit(1);
    }

    config = await createEmptyConfig();
    await saveConfig(config);

    spinner.succeed('Replexica project initialized');
  });
