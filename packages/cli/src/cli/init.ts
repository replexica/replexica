import { InteractiveCommand, InteractiveOption } from "interactive-commander";
import Ora from "ora";
import { getConfig, saveConfig } from "../utils/config";
import { defaultConfig, LocaleCode, resolveLocaleCode, bucketTypes } from "@replexica/spec";
import fs from "fs";
import { spawn } from "child_process";
import _ from "lodash";

const throwHelpError = (option: string, value: string) => {
  if (value === "help") {
    spawn("open", ["https://replexica.com/go/call"]);
  }
  throw new Error(
    `Invalid ${option}: ${value}\n\nDo you need support for ${value} ${option}? Type "help" and we will.`,
  );
};

export default new InteractiveCommand()
  .command("init")
  .description("Initialize Replexica project")
  .helpOption("-h, --help", "Show help")
  .addOption(new InteractiveOption("-f --force", "overwrite existing config").prompt(undefined).default(false))
  .addOption(
    new InteractiveOption("-s --source <locale>", "source locale")
      .argParser((value) => {
        try {
          resolveLocaleCode(value as LocaleCode);
        } catch (e) {
          throwHelpError("locale", value);
        }
        return value;
      })
      .default("en"),
  )
  .addOption(
    new InteractiveOption("-t --targets <locale...>", "list of target locales")
      .argParser((value) => {
        const values = (value.includes(",") ? value.split(",") : value.split(" ")) as LocaleCode[];
        values.forEach((value) => {
          try {
            resolveLocaleCode(value);
          } catch (e) {
            throwHelpError("locale", value);
          }
        });
        return values;
      })
      .default("es"),
  )
  .addOption(
    new InteractiveOption("-b, --bucket <type>", "type of bucket")
      .argParser((value) => {
        if (!bucketTypes.includes(value as (typeof bucketTypes)[number])) {
          throwHelpError("bucket format", value);
        }
        return value;
      })
      .default("json"),
  )
  .addOption(
    new InteractiveOption("-p, --paths <path...>", "list of paths for the bucket")
      .argParser((value) => {
        const values = value.includes(",") ? value.split(",") : value.split(" ");

        for (const path of values) {
          try {
            const stats = fs.statSync(path);
            if (!stats.isDirectory()) {
              throw new Error(`${path} is not a directory`);
            }
          } catch (err) {
            throw new Error(`Invalid directory path: ${path}`);
          }
        }

        return values;
      })
      .default("."),
  )
  .interactive("-i, --interactive", "interactive mode")
  .action(async (options) => {
    const spinner = Ora().start("Initializing Replexica project");

    let existingConfig = await getConfig(false);
    if (existingConfig && !options.force) {
      spinner.fail("Replexica project already initialized");
      return process.exit(1);
    }

    const newConfig = _.cloneDeep(defaultConfig);

    newConfig.locale.source = options.source;
    newConfig.locale.targets = options.targets;
    newConfig.buckets = {
      [options.bucket]: options.paths,
    };

    await saveConfig(newConfig);

    spinner.succeed("Replexica project initialized");
  });
