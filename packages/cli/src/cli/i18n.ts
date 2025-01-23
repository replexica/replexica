import { bucketTypeSchema, I18nConfig, localeCodeSchema } from "@replexica/spec";
import { ReplexicaEngine } from "@replexica/sdk";
import { Command } from "commander";
import Z from "zod";
import _ from "lodash";
import { getConfig } from "../utils/config";
import { getSettings } from "../utils/settings";
import { ReplexicaCLIError } from "../utils/errors";
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
  .option("--locale <locale>", "Locale to process")
  .option("--bucket <bucket>", "Bucket to process")
  .option("--key <key>", "Key to process")
  .option("--frozen", `Don't update the translations and fail if an update is needed`)
  .option("--force", "Ignore lockfile and process all keys")
  .option("--verbose", "Show verbose output")
  .option("--interactive", "Interactive mode")
  .option("--api-key <api-key>", "Explicitly set the API key to use")
  .option("--strict", "Stop on first error")
  .action(async function (options) {
    const ora = Ora();
    const flags = parseFlags(options);

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
      if (flags.bucket) {
        buckets = buckets.filter((bucket: any) => bucket.type === flags.bucket);
      }
      ora.succeed("Buckets retrieved");

      const targetLocales = getTargetLocales(i18nConfig!, flags);
      const lockfileHelper = createLockfileHelper();

      // Ensure the lockfile exists
      ora.start("Ensuring i18n.lock exists...");
      if (!lockfileHelper.isLockfileExists()) {
        ora.start("Creating i18n.lock...");
        for (const bucket of buckets) {
          for (const pathPattern of bucket.pathPatterns) {
            const bucketLoader = createBucketLoader(bucket.type, pathPattern);
            bucketLoader.setDefaultLocale(i18nConfig!.locale.source);

            const sourceData = await bucketLoader.pull(i18nConfig!.locale.source);
            lockfileHelper.registerSourceData(pathPattern, sourceData);
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
          for (const pathPattern of bucket.pathPatterns) {
            const bucketLoader = createBucketLoader(bucket.type, pathPattern);
            bucketLoader.setDefaultLocale(i18nConfig!.locale.source);

            const sourceData = await bucketLoader.pull(i18nConfig!.locale.source);
            const updatedSourceData = lockfileHelper.extractUpdatedData(pathPattern, sourceData);

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
          for (const pathPattern of bucket.pathPatterns) {
            const bucketOra = Ora({ indent: 2 }).info(`Processing path: ${pathPattern}`);

            const bucketLoader = createBucketLoader(bucket.type, pathPattern);
            bucketLoader.setDefaultLocale(i18nConfig!.locale.source);
            let sourceData = await bucketLoader.pull(i18nConfig!.locale.source);

            for (const targetLocale of targetLocales) {
              try {
                bucketOra.start(`[${i18nConfig!.locale.source} -> ${targetLocale}] (0%) Localization in progress...`);

                sourceData = await bucketLoader.pull(i18nConfig!.locale.source);

                const updatedSourceData = flags.force
                  ? sourceData
                  : lockfileHelper.extractUpdatedData(pathPattern, sourceData);

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
                  `[${i18nConfig!.locale.source} -> ${targetLocale}] [${Object.keys(processableData).length} entries] (0%) AI localization in progress...`,
                );
                const localizationEngine = createLocalizationEngineConnection({
                  apiKey: settings.auth.apiKey,
                  apiUrl: settings.auth.apiUrl,
                });
                const processedTargetData = await localizationEngine.process(
                  {
                    sourceLocale: i18nConfig!.locale.source,
                    sourceData,
                    processableData,
                    targetLocale,
                    targetData,
                  },
                  (progress) => {
                    bucketOra.text = `[${i18nConfig!.locale.source} -> ${targetLocale}] [${Object.keys(processableData).length} entries] (${progress}%) AI localization in progress...`;
                  },
                );

                if (flags.verbose) {
                  bucketOra.info(JSON.stringify(processedTargetData, null, 2));
                }

                let finalTargetData = _.merge({}, sourceData, targetData, processedTargetData);

                if (flags.interactive) {
                  bucketOra.stop();
                  const reviewedData = await reviewChanges({
                    pathPattern,
                    targetLocale,
                    currentData: targetData,
                    proposedData: finalTargetData,
                    sourceData,
                    force: flags.force!,
                  });

                  finalTargetData = reviewedData;
                  bucketOra.start(`Applying changes to ${pathPattern} (${targetLocale})`);
                }

                const finalDiffSize = _.chain(finalTargetData)
                  .omitBy((value, key) => value === targetData[key])
                  .size()
                  .value();
                if (finalDiffSize > 0 || flags.force) {
                  await bucketLoader.push(targetLocale, finalTargetData);
                  bucketOra.succeed(`[${i18nConfig!.locale.source} -> ${targetLocale}] Localization completed`);
                } else {
                  bucketOra.succeed(
                    `[${i18nConfig!.locale.source} -> ${targetLocale}] Localization completed (no changes).`,
                  );
                }
              } catch (_error: any) {
                const error = new Error(
                  `[${i18nConfig!.locale.source} -> ${targetLocale}] Localization failed: ${_error.message}`,
                );
                if (flags.strict) {
                  throw error;
                } else {
                  bucketOra.fail(error.message);
                  hasErrors = true;
                }
              }
            }

            lockfileHelper.registerSourceData(pathPattern, sourceData);
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

function getTargetLocales(i18nConfig: I18nConfig, flags: ReturnType<typeof parseFlags>) {
  let result = i18nConfig.locale.targets;
  if (flags.locale) {
    result = result.filter((locale) => locale === flags.locale);
  }
  return result;
}

function parseFlags(options: any) {
  return Z.object({
    apiKey: Z.string().optional(),
    locale: localeCodeSchema.optional(),
    bucket: bucketTypeSchema.optional(),
    force: Z.boolean().optional(),
    frozen: Z.boolean().optional(),
    verbose: Z.boolean().optional(),
    strict: Z.boolean().optional(),
    key: Z.string().optional(),
    interactive: Z.boolean().default(false),
  }).parse(options);
}

async function validateAuth(settings: ReturnType<typeof getSettings>) {
  if (!settings.auth.apiKey) {
    throw new ReplexicaCLIError({
      message: "Not authenticated. Please run `replexica auth --login` to authenticate.",
      docUrl: "authError",
    });
  }

  const authenticator = createAuthenticator({
    apiKey: settings.auth.apiKey,
    apiUrl: settings.auth.apiUrl,
  });
  const user = await authenticator.whoami();
  if (!user) {
    throw new ReplexicaCLIError({
      message: "Invalid API key. Please run `replexica auth --login` to authenticate.",
      docUrl: "authError",
    });
  }

  return user;
}

function validateParams(i18nConfig: I18nConfig | null, flags: ReturnType<typeof parseFlags>) {
  if (!i18nConfig) {
    throw new ReplexicaCLIError({
      message: "i18n.json not found. Please run `replexica init` to initialize the project.",
      docUrl: "i18nNotFound",
    });
  } else if (!i18nConfig.buckets || !Object.keys(i18nConfig.buckets).length) {
    throw new ReplexicaCLIError({
      message: "No buckets found in i18n.json. Please add at least one bucket containing i18n content.",
      docUrl: "bucketNotFound",
    });
  } else if (flags.locale && !i18nConfig.locale.targets.includes(flags.locale)) {
    throw new ReplexicaCLIError({
      message: `Source locale ${i18nConfig.locale.source} does not exist in i18n.json locale.targets. Please add it to the list and try again.`,
      docUrl: "localeTargetNotFound",
    });
  } else if (flags.bucket && !i18nConfig.buckets[flags.bucket as keyof typeof i18nConfig.buckets]) {
    throw new ReplexicaCLIError({
      message: `Bucket ${flags.bucket} does not exist in i18n.json. Please add it to the list and try again.`,
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
