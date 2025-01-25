import { Command } from "interactive-commander";
import _ from "lodash";
import Ora from "ora";
import { getConfig } from "../../utils/config";
import { ReplexicaCLIError } from "../../utils/errors";
import { getBuckets } from "../../utils/buckets";
import { resolveOverridenLocale } from "@replexica/spec";

export default new Command()
  .command("files")
  .description("Print out the list of files managed by Replexica")
  .option("--source", "Only show source files")
  .option("--target", "Only show target files")
  .helpOption("-h, --help", "Show help")
  .action(async (type) => {
    const ora = Ora();
    try {
      try {
        const i18nConfig = await getConfig();

        if (!i18nConfig) {
          throw new ReplexicaCLIError({
            message: "i18n.json not found. Please run `replexica init` to initialize the project.",
            docUrl: "i18nNotFound",
          });
        }

        const buckets = getBuckets(i18nConfig);
        for (const bucket of buckets) {
          for (const bucketConfig of bucket.config) {
            const sourceLocale = resolveOverridenLocale(i18nConfig.locale.source, bucketConfig.delimiter);
            const sourcePath = bucketConfig.pathPattern.replace(/\[locale\]/g, sourceLocale);
            const targetPaths = i18nConfig.locale.targets.map((_targetLocale) => {
              const targetLocale = resolveOverridenLocale(_targetLocale, bucketConfig.delimiter);
              return bucketConfig.pathPattern.replace(/\[locale\]/g, targetLocale);
            });

            const result: string[] = [];
            if (!type.source && !type.target) {
              result.push(sourcePath, ...targetPaths);
            } else if (type.source) {
              result.push(sourcePath);
            } else if (type.target) {
              result.push(...targetPaths);
            }

            result.forEach((path) => {
              console.log(path);
            });
          }
        }
      } catch (error: any) {
        throw new ReplexicaCLIError({
          message: `Failed to expand placeholdered globs: ${error.message}`,
          docUrl: "placeHolderFailed",
        });
      }
    } catch (error: any) {
      ora.fail(error.message);
      process.exit(1);
    }
  });
