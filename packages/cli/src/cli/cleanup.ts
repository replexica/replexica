import { I18nConfig } from "@replexica/spec";
import { Command } from "commander";
import _ from "lodash";
import { getConfig } from "../utils/config";
import { ReplexicaCLIError } from "../utils/errors";
import Ora from "ora";
import createBucketLoader from "../loaders";
import { getBuckets } from "../utils/buckets";

export default new Command()
  .command("cleanup")
  .description(
    "Remove keys from target files that do not exist in the source file",
  )
  .helpOption("-h, --help", "Show help")
  .option("--locale <locale>", "Specific locale to cleanup")
  .option("--bucket <bucket>", "Specific bucket to cleanup")
  .option("--dry-run", "Show what would be removed without making changes")
  .option("--verbose", "Show verbose output")
  .action(async function (options) {
    const ora = Ora();
    const results: any = [];

    try {
      ora.start("Loading configuration...");
      const i18nConfig = getConfig();
      validateConfig(i18nConfig);
      ora.succeed("Configuration loaded");

      let buckets = getBuckets(i18nConfig!);
      if (options.bucket) {
        buckets = buckets.filter(
          (bucket: any) => bucket.type === options.bucket,
        );
      }

      const targetLocales = options.locale
        ? [options.locale]
        : i18nConfig!.locale.targets;

      // Process each bucket
      for (const bucket of buckets) {
        console.log();
        ora.info(`Processing bucket: ${bucket.type}`);

        for (const pathPattern of bucket.pathPatterns) {
          const bucketOra = Ora({ indent: 2 }).info(
            `Processing path: ${pathPattern}`,
          );
          const bucketLoader = createBucketLoader(bucket.type, pathPattern);
          bucketLoader.setDefaultLocale(i18nConfig!.locale.source);

          // Load source data
          const sourceData = await bucketLoader.pull(i18nConfig!.locale.source);
          const sourceKeys = Object.keys(sourceData);

          for (const targetLocale of targetLocales) {
            try {
              const targetData = await bucketLoader.pull(targetLocale);
              const targetKeys = Object.keys(targetData);
              const keysToRemove = _.difference(targetKeys, sourceKeys);

              if (keysToRemove.length === 0) {
                bucketOra.succeed(`[${targetLocale}] No keys to remove`);
                continue;
              }

              if (options.verbose) {
                bucketOra.info(
                  `[${targetLocale}] Keys to remove: ${JSON.stringify(keysToRemove, null, 2)}`,
                );
              }

              if (!options.dryRun) {
                const cleanedData = _.pick(targetData, sourceKeys);
                await bucketLoader.push(targetLocale, cleanedData);
                bucketOra.succeed(
                  `[${targetLocale}] Removed ${keysToRemove.length} keys`,
                );
              } else {
                bucketOra.succeed(
                  `[${targetLocale}] Would remove ${keysToRemove.length} keys (dry run)`,
                );
              }
            } catch (error: any) {
              bucketOra.fail(
                `[${targetLocale}] Failed to cleanup: ${error.message}`,
              );
              results.push({
                step: `Cleanup ${bucket.type}/${pathPattern} for ${targetLocale}`,
                status: "Failed",
                error: error.message,
              });
            }
          }
        }
      }

      console.log();
      ora.succeed("Cleanup completed!");
    } catch (error: any) {
      ora.fail(error.message);
      process.exit(1);
    } finally {
      displaySummary(results);
    }
  });

function validateConfig(i18nConfig: I18nConfig | null) {
  if (!i18nConfig) {
    throw new ReplexicaCLIError({
      message:
        "i18n.json not found. Please run `replexica init` to initialize the project.",
      docUrl: "i18nNotFound",
    });
  }
  if (!i18nConfig.buckets || !Object.keys(i18nConfig.buckets).length) {
    throw new ReplexicaCLIError({
      message:
        "No buckets found in i18n.json. Please add at least one bucket containing i18n content.",
      docUrl: "bucketNotFound",
    });
  }
}

function displaySummary(results: any[]) {
  if (results.length === 0) return;

  console.log("\nProcess Summary:");
  results.forEach((result) => {
    console.log(`${result.step}: ${result.status}`);
    if (result.error) console.log(`  - Error: ${result.error}`);
  });
}
