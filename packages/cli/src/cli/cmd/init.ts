import { InteractiveCommand, InteractiveOption } from "interactive-commander";
import Ora from "ora";
import { getConfig, saveConfig } from "../utils/config";
import { defaultConfig, LocaleCode, resolveLocaleCode, bucketTypes } from "@lingo.dev/~spec";
import fs from "fs";
import { spawn } from "child_process";
import _ from "lodash";
import { confirm } from "@inquirer/prompts";
import { login } from "./auth";
import { getSettings, saveSettings } from "../utils/settings";
import { createAuthenticator } from "../utils/auth";

const openUrl = (path: string) => {
  const settings = getSettings(undefined);
  spawn("open", [`${settings.auth.webUrl}${path}`]);
};

const throwHelpError = (option: string, value: string) => {
  if (value === "help") {
    openUrl("/go/call");
  }
  throw new Error(
    `Invalid ${option}: ${value}\n\nDo you need support for ${value} ${option}? Type "help" and we will.`,
  );
};

export default new InteractiveCommand()
  .command("init")
  .description("Initialize Lingo.dev project")
  .helpOption("-h, --help", "Show help")
  .addOption(new InteractiveOption("-f --force", "Overwrite existing config").prompt(undefined).default(false))
  .addOption(
    new InteractiveOption("-s --source <locale>", "Source locale")
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
    new InteractiveOption("-t --targets <locale...>", "List of target locales")
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
    new InteractiveOption("-b, --bucket <type>", "Type of bucket")
      .argParser((value) => {
        if (!bucketTypes.includes(value as (typeof bucketTypes)[number])) {
          throwHelpError("bucket format", value);
        }
        return value;
      })
      .default("json"),
  )
  .addOption(
    new InteractiveOption("-p, --paths <path...>", "List of paths for the bucket")
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
  .action(async (options) => {
    const settings = getSettings(undefined);

    const spinner = Ora().start("Initializing Lingo.dev project");

    let existingConfig = await getConfig(false);
    if (existingConfig && !options.force) {
      spinner.fail("Lingo.dev project already initialized");
      return process.exit(1);
    }

    const newConfig = _.cloneDeep(defaultConfig);

    newConfig.locale.source = options.source;
    newConfig.locale.targets = options.targets;
    newConfig.buckets = {
      [options.bucket]: options.paths,
    };

    await saveConfig(newConfig);

    spinner.succeed("Lingo.dev project initialized");

    const isInteractive = !process.argv.includes("-y") && !process.argv.includes("--no-interactive");

    if (isInteractive) {
      const openDocs = await confirm({ message: "Would you like to see our docs?" });
      if (openDocs) {
        openUrl("/go/docs");
      }
    }

    const authenticator = createAuthenticator({
      apiKey: settings.auth.apiKey,
      apiUrl: settings.auth.apiUrl,
    });
    const auth = await authenticator.whoami();
    if (!auth) {
      if (isInteractive) {
        const doAuth = await confirm({
          message: "It looks like you are not logged into the CLI. Login now?",
        });
        if (doAuth) {
          const apiKey = await login(settings.auth.webUrl);
          settings.auth.apiKey = apiKey;
          await saveSettings(settings);

          const newAuthenticator = createAuthenticator({
            apiKey: settings.auth.apiKey,
            apiUrl: settings.auth.apiUrl,
          });
          const auth = await newAuthenticator.whoami();
          if (auth) {
            Ora().succeed(`Authenticated as ${auth?.email}`);
          } else {
            Ora().fail("Authentication failed.");
          }
        }
      } else {
        Ora().warn("You are not logged in. Run `npx lingo.dev@latest auth --login` to login.");
      }
    } else {
      Ora().succeed(`Authenticated as ${auth.email}`);
    }

    if (!isInteractive) {
      Ora().info("Please see https://docs.lingo.dev/");
    }
  });
