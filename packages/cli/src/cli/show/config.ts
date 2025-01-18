import { Command } from "commander";
import _ from "lodash";
import fs from "fs";
import path from "path";
import { defaultConfig } from "@replexica/spec";

export default new Command()
  .command("config")
  .description("Print out the current configuration")
  .helpOption("-h, --help", "Show help")
  .action(async (options) => {
    const fileConfig = loadReplexicaFileConfig();
    const config = _.merge({}, defaultConfig, fileConfig);

    console.log(JSON.stringify(config, null, 2));
  });

function loadReplexicaFileConfig(): any {
  const replexicaConfigPath = path.resolve(process.cwd(), "i18n.json");
  const fileExists = fs.existsSync(replexicaConfigPath);
  if (!fileExists) {
    return undefined;
  }

  const fileContent = fs.readFileSync(replexicaConfigPath, "utf-8");
  const replexicaFileConfig = JSON.parse(fileContent);
  return replexicaFileConfig;
}
