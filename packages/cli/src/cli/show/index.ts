import { Command } from "commander";
import _ from "lodash";
import configCmd from "./config";
import localeCmd from "./locale";
import filesCmd from "./files";

export default new Command()
  .command("show")
  .description("Prints out the current configuration")
  .helpOption("-h, --help", "Show help")
  .addCommand(configCmd)
  .addCommand(localeCmd)
  .addCommand(filesCmd);
