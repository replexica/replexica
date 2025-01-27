import { bucketTypeSchema, I18nConfig, localeCodeSchema, resolveOverridenLocale } from "@lingo.dev/spec";
import { ReplexicaEngine } from "@lingo.dev/sdk";
import { Command } from "interactive-commander";
import Z from "zod";
import _ from "lodash";
import { getConfig } from "../utils/config";
import { getSettings } from "../utils/settings";
import { CLIError } from "../utils/errors";
import Ora from "ora";
import createBucketLoader from "../loaders";
import { createLockfileHelper } from "../utils/lockfile";
import { createAuthenticator } from "../utils/auth";
import { getBuckets } from "../utils/buckets";
import chalk from "chalk";
import { createTwoFilesPatch } from "diff";
import inquirer from "inquirer";
import externalEditor from "external-editor";

export default new Command()
  .command("i18n")
  .description("Run Localization engine")
  .helpOption("-h, --help", "Show help")
  .option("--locale <locale>", "Locale to process", (val: string, prev: string[]) => (prev ? [...prev, val] : [val]))
  .option("--bucket <bucket>", "Bucket to process", (val: string, prev: string[]) => (prev ? [...prev, val] : [val]))
  .option("--key <key>", "Key to process")
  .option("--frozen", `Don't update the translations and fail if an update is needed`)
  .option("--force", "Ignore lockfile and process all keys")
  .option("--verbose", "Show verbose output")
  .option("--interactive", "Interactive mode")
  .option("--api-key <api-key>", "Explicitly set the API key to use")
  .option("--debug", "Debug mode")
  .option("--strict", "Stop on first error")
  .action(async function (options) {
    const ora = Ora();
    const flags = parseFlags(options);

    if (flags.debug) {
      // wait for user input, use inquirer
      const { debug } = await inquirer.prompt([
        {
          type: "confirm",
          name: "debug",
          message: "Debug mode. Wait for user input before continuing.",
        },
      ]);
    }

    let hasErrors = false;
    try {
      ora.start("Loading configuration...");
      const i18nConfig = getConfig();
      const settings = getSettings(flags.apiKey);
      ora.succeed("Configuration loaded");

      ora.start("Validating localization configuration...");
      validateParams(i18nConfig, flags);
      ora.succeed("Localization configuration is valid");

      ora.start("Connecting to Replexica Localization Engine...");
      const auth = await validateAuth(settings);
      ora.succeed(`Authenticated as ${auth.email}`);

      let buckets = getBuckets(i18nConfig!);
      if (flags.bucket?.length) {
        buckets = buckets.filter((bucket: any) => flags.bucket!.includes(bucket.type));
      }
      ora.succeed("Buckets retrieved");

      const targetLocales = flags.locale?.length ? flags.locale : i18nConfig!.locale.targets;
      const lockfileHelper = createLockfileHelper();

      // Ensure the lockfile exists
      ora.start("Ensuring i18n.lock exists...");
      if (!lockfileHelper.isLockfileExists()) {
        ora.start("Creating i18n.lock...");
        for (const bucket of buckets) {
          for (const bucketConfig of bucket.config) {
            const sourceLocale = resolveOverridenLocale(i18nConfig!.locale.source, bucketConfig.delimiter);

            const bucketLoader = createBucketLoader(bucket.type, bucketConfig.pathPattern);
            bucketLoader.setDefaultLocale(sourceLocale);
            await bucketLoader.init();

            const sourceData = await bucketLoader.pull(i18nConfig!.locale.source);
            lockfileHelper.registerSourceData(bucketConfig.pathPattern, sourceData);
          }
        }
        ora.succeed("i18n.lock created");
      } else {
        ora.succeed("i18n.lock loaded");
      }

      if (flags.frozen) {
        ora.start("Checking for lockfile updates...");
        let requiresUpdate = false;
        for (const bucket of buckets) {
          for (const bucketConfig of bucket.config) {
            const sourceLocale = resolveOverridenLocale(i18nConfig!.locale.source, bucketConfig.delimiter);

            const bucketLoader = createBucketLoader(bucket.type, bucketConfig.pathPattern);
            bucketLoader.setDefaultLocale(sourceLocale);
            await bucketLoader.init();

            const sourceData = await bucketLoader.pull(i18nConfig!.locale.source);
            const updatedSourceData = lockfileHelper.extractUpdatedData(bucketConfig.pathPattern, sourceData);

            if (Object.keys(updatedSourceData).length > 0) {
              requiresUpdate = true;
              break;
            }
          }
          if (requiresUpdate) break;
        }

        if (requiresUpdate) {
          ora.fail("Localization data has changed; please update i18n.lock or run without --frozen.");
          process.exit(1);
        } else {
          ora.succeed("No lockfile updates required.");
        }
      }

      // Process each bucket
      for (const bucket of buckets) {
        try {
          console.log();
          ora.info(`Processing bucket: ${bucket.type}`);
          for (const bucketConfig of bucket.config) {
            const bucketOra = Ora({ indent: 2 }).info(`Processing path: ${bucketConfig.pathPattern}`);

            const sourceLocale = resolveOverridenLocale(i18nConfig!.locale.source, bucketConfig.delimiter);

            const bucketLoader = createBucketLoader(bucket.type, bucketConfig.pathPattern);
            bucketLoader.setDefaultLocale(sourceLocale);
            await bucketLoader.init();
            let sourceData = await bucketLoader.pull(sourceLocale);

            for (const _targetLocale of targetLocales) {
              const targetLocale = resolveOverridenLocale(_targetLocale, bucketConfig.delimiter);
              try {
                bucketOra.start(`[${sourceLocale} -> ${targetLocale}] (0%) Localization in progress...`);

                sourceData = await bucketLoader.pull(sourceLocale);

                const updatedSourceData = flags.force
                  ? sourceData
                  : lockfileHelper.extractUpdatedData(bucketConfig.pathPattern, sourceData);

                const targetData = await bucketLoader.pull(targetLocale);
                let processableData = calculateDataDelta({
                  sourceData,
                  updatedSourceData,
                  targetData,
                });
                if (flags.key) {
                  processableData = _.pickBy(processableData, (_, key) => key === flags.key);
                }
                if (flags.verbose) {
                  bucketOra.info(JSON.stringify(processableData, null, 2));
                }

                bucketOra.start(
                  `[${sourceLocale} -> ${targetLocale}] [${Object.keys(processableData).length} entries] (0%) AI localization in progress...`,
                );
                const localizationEngine = createLocalizationEngineConnection({
                  apiKey: settings.auth.apiKey,
                  apiUrl: settings.auth.apiUrl,
                });
                const processedTargetData = await localizationEngine.process(
                  {
                    sourceLocale,
                    sourceData,
                    processableData,
                    targetLocale,
                    targetData,
                  },
                  (progress) => {
                    bucketOra.text = `[${sourceLocale} -> ${targetLocale}] [${Object.keys(processableData).length} entries] (${progress}%) AI localization in progress...`;
                  },
                );

                if (flags.verbose) {
                  bucketOra.info(JSON.stringify(processedTargetData, null, 2));
                }

                let finalTargetData = _.merge({}, sourceData, targetData, processedTargetData);

                if (flags.interactive) {
                  bucketOra.stop();
                  const reviewedData = await reviewChanges({
                    pathPattern: bucketConfig.pathPattern,
                    targetLocale,
                    currentData: targetData,
                    proposedData: finalTargetData,
                    sourceData,
                    force: flags.force!,
                  });

                  finalTargetData = reviewedData;
                  bucketOra.start(`Applying changes to ${bucketConfig} (${targetLocale})`);
                }

                const finalDiffSize = _.chain(finalTargetData)
                  .omitBy((value, key) => value === targetData[key])
                  .size()
                  .value();
                if (finalDiffSize > 0 || flags.force) {
                  await bucketLoader.push(targetLocale, finalTargetData);
                  bucketOra.succeed(`[${sourceLocale} -> ${targetLocale}] Localization completed`);
                } else {
                  bucketOra.succeed(`[${sourceLocale} -> ${targetLocale}] Localization completed (no changes).`);
                }
              } catch (_error: any) {
                const error = new Error(`[${sourceLocale} -> ${targetLocale}] Localization failed: ${_error.message}`);
                if (flags.strict) {
                  throw error;
                } else {
                  bucketOra.fail(error.message);
                  hasErrors = true;
                }
              }
            }

            lockfileHelper.registerSourceData(bucketConfig.pathPattern, sourceData);
          }
        } catch (_error: any) {
          const error = new Error(`Failed to process bucket ${bucket.type}: ${_error.message}`);
          if (flags.strict) {
            throw error;
          } else {
            ora.fail(error.message);
            hasErrors = true;
          }
        }
      }
      console.log();
      if (!hasErrors) {
        ora.succeed("Localization completed.");
      } else {
        ora.warn("Localization completed with errors.");
      }
    } catch (error: any) {
      ora.fail(error.message);
      process.exit(1);
    }
  });

function calculateDataDelta(args: {
  sourceData: Record<string, any>;
  updatedSourceData: Record<string, any>;
  targetData: Record<string, any>;
}) {
  // Calculate missing keys
  const newKeys = _.difference(Object.keys(args.sourceData), Object.keys(args.targetData));
  // Calculate updated keys
  const updatedKeys = Object.keys(args.updatedSourceData);

  // Calculate delta payload
  const result = _.chain(args.sourceData)
    .pickBy((value, key) => newKeys.includes(key) || updatedKeys.includes(key))
    .value() as Record<string, any>;

  return result;
}

async function retryWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number,
  baseDelay: number = 1000,
): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts - 1) throw error;

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Unreachable code");
}

function createLocalizationEngineConnection(params: { apiKey: string; apiUrl: string; maxRetries?: number }) {
  const replexicaEngine = new ReplexicaEngine({
    apiKey: params.apiKey,
    apiUrl: params.apiUrl,
  });

  return {
    process: async (
      args: {
        sourceLocale: string;
        sourceData: Record<string, any>;
        processableData: Record<string, any>;
        targetLocale: string;
        targetData: Record<string, any>;
      },
      onProgress: (progress: number) => void,
    ) => {
      return retryWithExponentialBackoff(
        () =>
          replexicaEngine.localizeObject(
            args.processableData,
            {
              sourceLocale: args.sourceLocale,
              targetLocale: args.targetLocale,
            },
            onProgress,
          ),
        params.maxRetries ?? 3,
      );
    },
  };
}

function parseFlags(options: any) {
  return Z.object({
    apiKey: Z.string().optional(),
    locale: Z.array(localeCodeSchema).optional(),
    bucket: Z.array(bucketTypeSchema).optional(),
    force: Z.boolean().optional(),
    frozen: Z.boolean().optional(),
    verbose: Z.boolean().optional(),
    strict: Z.boolean().optional(),
    key: Z.string().optional(),
    interactive: Z.boolean().default(false),
    debug: Z.boolean().default(false),
  }).parse(options);
}

async function validateAuth(settings: ReturnType<typeof getSettings>) {
  if (!settings.auth.apiKey) {
    throw new CLIError({
      message: "Not authenticated. Please run `lingo.dev auth --login` to authenticate.",
      docUrl: "authError",
    });
  }

  const authenticator = createAuthenticator({
    apiKey: settings.auth.apiKey,
    apiUrl: settings.auth.apiUrl,
  });
  const user = await authenticator.whoami();
  if (!user) {
    throw new CLIError({
      message: "Invalid API key. Please run `lingo.dev auth --login` to authenticate.",
      docUrl: "authError",
    });
  }

  return user;
}

function validateParams(i18nConfig: I18nConfig | null, flags: ReturnType<typeof parseFlags>) {
  if (!i18nConfig) {
    throw new CLIError({
      message: "i18n.json not found. Please run `lingo.dev init` to initialize the project.",
      docUrl: "i18nNotFound",
    });
  } else if (!i18nConfig.buckets || !Object.keys(i18nConfig.buckets).length) {
    throw new CLIError({
      message: "No buckets found in i18n.json. Please add at least one bucket containing i18n content.",
      docUrl: "bucketNotFound",
    });
  } else if (flags.locale?.some((locale) => !i18nConfig.locale.targets.includes(locale))) {
    throw new CLIError({
      message: `One or more specified locales do not exist in i18n.json locale.targets. Please add them to the list and try again.`,
      docUrl: "localeTargetNotFound",
    });
  } else if (flags.bucket?.some((bucket) => !i18nConfig.buckets[bucket as keyof typeof i18nConfig.buckets])) {
    throw new CLIError({
      message: `One or more specified buckets do not exist in i18n.json. Please add them to the list and try again.`,
      docUrl: "bucketNotFound",
    });
  }
}

async function reviewChanges(args: {
  pathPattern: string;
  targetLocale: string;
  currentData: Record<string, any>;
  proposedData: Record<string, any>;
  sourceData: Record<string, any>;
  force: boolean;
}): Promise<Record<string, any>> {
  const currentStr = JSON.stringify(args.currentData, null, 2);
  const proposedStr = JSON.stringify(args.proposedData, null, 2);

  // Early return if no changes
  if (currentStr === proposedStr && !args.force) {
    console.log(
      `\n${chalk.blue(args.pathPattern)} (${chalk.yellow(args.targetLocale)}): ${chalk.gray("No changes to review")}`,
    );
    return args.proposedData;
  }

  const patch = createTwoFilesPatch(
    `${args.pathPattern} (current)`,
    `${args.pathPattern} (proposed)`,
    currentStr,
    proposedStr,
    undefined,
    undefined,
    { context: 3 },
  );

  // Color the diff output
  const coloredDiff = patch
    .split("\n")
    .map((line) => {
      if (line.startsWith("+")) return chalk.green(line);
      if (line.startsWith("-")) return chalk.red(line);
      if (line.startsWith("@")) return chalk.cyan(line);
      return line;
    })
    .join("\n");

  console.log(`\nReviewing changes for ${chalk.blue(args.pathPattern)} (${chalk.yellow(args.targetLocale)}):`);
  console.log(coloredDiff);

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "Choose action:",
      choices: [
        { name: "Approve changes", value: "approve" },
        { name: "Skip changes", value: "skip" },
        { name: "Edit individually", value: "edit" },
      ],
      default: "approve",
    },
  ]);

  if (action === "approve") {
    return args.proposedData;
  }

  if (action === "skip") {
    return args.currentData;
  }

  // If edit was chosen, prompt for each changed value
  const customData = { ...args.currentData };
  const changes = _.reduce(
    args.proposedData,
    (result: string[], value: string, key: string) => {
      if (args.currentData[key] !== value) {
        result.push(key);
      }
      return result;
    },
    [],
  );

  for (const key of changes) {
    console.log(`\nEditing value for: ${chalk.cyan(key)}`);
    console.log(chalk.gray("Source text:"), chalk.blue(args.sourceData[key]));
    console.log(chalk.gray("Current value:"), chalk.red(args.currentData[key] || "(empty)"));
    console.log(chalk.gray("Suggested value:"), chalk.green(args.proposedData[key]));
    console.log(chalk.gray("\nYour editor will open. Edit the text and save to continue."));
    console.log(chalk.gray("------------"));

    try {
      // Prepare the editor content with a header comment and the suggested value
      const editorContent = [
        "# Edit the translation below.",
        "# Lines starting with # will be ignored.",
        "# Save and exit the editor to continue.",
        "#",
        `# Source text (${chalk.blue("English")}):`,
        `# ${args.sourceData[key]}`,
        "#",
        `# Current value (${chalk.red(args.targetLocale)}):`,
        `# ${args.currentData[key] || "(empty)"}`,
        "#",
        args.proposedData[key],
      ].join("\n");

      const result = externalEditor.edit(editorContent);

      // Clean up the result by removing comments and trimming
      const customValue = result
        .split("\n")
        .filter((line) => !line.startsWith("#"))
        .join("\n")
        .trim();

      if (customValue) {
        customData[key] = customValue;
      } else {
        console.log(chalk.yellow("Empty value provided, keeping the current value."));
        customData[key] = args.currentData[key] || args.proposedData[key];
      }
    } catch (error) {
      console.log(chalk.red("Error while editing, keeping the suggested value."));
      customData[key] = args.proposedData[key];
    }
  }

  return customData;
}
