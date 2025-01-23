import { Command } from "commander";
import { I18nConfig } from "@replexica/spec";
import Ora from "ora";
import { getConfig } from "../utils/config";
import { ReplexicaCLIError } from "../utils/errors";
import createBucketLoader from "../loaders";
import { getBuckets } from "../utils/buckets";
import _ from "lodash";

export default new Command()
  .command("rm")
  .description("Remove keys from localization files")
  .helpOption("-h, --help", "Show help")
  .requiredOption("--starts-with <prefix>", "Remove keys that start with this prefix (will be URI encoded)")
  .requiredOption("--locale <locale>", "Specific locale to remove keys from")
  .requiredOption("--bucket <bucket>", "Specific bucket to remove keys from")
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
      buckets = buckets.filter((bucket: any) => bucket.type === options.bucket);

      if (buckets.length === 0) {
        throw new ReplexicaCLIError({
          message: `Bucket "${options.bucket}" not found in configuration`,
          docUrl: "bucketNotFound",
        });
      }

      const targetLocales = [options.locale];
      const prefix = encodeURIComponent(options.startsWith);

      // Process each bucket
      for (const bucket of buckets) {
        console.log();
        ora.info(`Processing bucket: ${bucket.type}`);

        for (const pathPattern of bucket.pathPatterns) {
          const bucketOra = Ora({ indent: 2 }).info(`Processing path: ${pathPattern}`);
          for (const locale of targetLocales) {
            try {
              const bucketLoader = createBucketLoader(bucket.type, pathPattern);
              bucketLoader.setDefaultLocale(locale);
              const data = await bucketLoader.pull(locale);
              const keysToRemove = Object.keys(data).filter((key) => key.startsWith(prefix));

              if (keysToRemove.length === 0) {
                bucketOra.succeed(`[${locale}] No matching keys found`);
                continue;
              }

              if (options.verbose) {
                bucketOra.info(`[${locale}] Keys to remove: ${JSON.stringify(keysToRemove, null, 2)}`);
              }

              if (!options.dryRun) {
                const cleanedData = _.omit(data, keysToRemove);
                await bucketLoader.push(locale, cleanedData);
                bucketOra.succeed(`[${locale}] Removed ${keysToRemove.length} keys`);
              } else {
                bucketOra.succeed(`[${locale}] Would remove ${keysToRemove.length} keys (dry run)`);
              }
            } catch (error: any) {
              bucketOra.fail(`[${locale}] Failed to remove keys: ${error.message}`);
              results.push({
                step: `Remove keys from ${bucket.type}/${pathPattern} for ${locale}`,
                status: "Failed",
                error: error.message,
              });
            }
          }
        }
      }

      console.log();
      ora.succeed("Key removal completed!");
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
      message: "i18n.json not found. Please run `replexica init` to initialize the project.",
      docUrl: "i18nNotFound",
    });
  }
  if (!i18nConfig.buckets || !Object.keys(i18nConfig.buckets).length) {
    throw new ReplexicaCLIError({
      message: "No buckets found in i18n.json. Please add at least one bucket containing i18n content.",
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
