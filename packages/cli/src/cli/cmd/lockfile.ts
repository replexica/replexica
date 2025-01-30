import { Command } from "interactive-commander";
import Z from "zod";
import Ora from "ora";
import { createLockfileHelper } from "../utils/lockfile";
import { bucketTypeSchema, resolveOverridenLocale } from "@lingo.dev/spec";
import { getConfig } from "../utils/config";
import createBucketLoader from "../loaders";
import { getBuckets } from "../utils/buckets";

export default new Command()
  .command("lockfile")
  .description("Create a lockfile if it does not exist")
  .helpOption("-h, --help", "Show help")
  .option("-f, --force", "Force create a lockfile")
  .action(async (options) => {
    const flags = flagsSchema.parse(options);
    const ora = Ora();

    const lockfileHelper = createLockfileHelper();
    if (lockfileHelper.isLockfileExists() && !flags.force) {
      ora.warn(`Lockfile won't be created because it already exists. Use --force to overwrite.`);
    } else {
      const i18nConfig = getConfig();
      const buckets = getBuckets(i18nConfig!);

      for (const bucket of buckets) {
        for (const bucketConfig of bucket.config) {
          const sourceLocale = resolveOverridenLocale(i18nConfig!.locale.source, bucketConfig.delimiter);
          const bucketLoader = createBucketLoader(bucket.type, bucketConfig.pathPattern);
          bucketLoader.setDefaultLocale(sourceLocale);

          const sourceData = await bucketLoader.pull(sourceLocale);
          lockfileHelper.registerSourceData(bucketConfig.pathPattern, sourceData);
        }
      }
      ora.succeed("Lockfile created");
    }
  });

const flagsSchema = Z.object({
  force: Z.boolean().default(false),
});
