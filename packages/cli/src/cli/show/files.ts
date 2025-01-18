import { Command } from "commander";
import _ from "lodash";
import Ora from "ora";
import { getConfig } from "../../utils/config";
import { ReplexicaCLIError } from "../../utils/errors";
import { getBuckets } from "../../utils/buckets";

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
            message:
              "i18n.json not found. Please run `replexica init` to initialize the project.",
            docUrl: "i18nNotFound",
          });
        }

        const buckets = getBuckets(i18nConfig);
        for (const bucket of buckets) {
          for (const pathPattern of bucket.pathPatterns) {
            const sourcePath = pathPattern.replace(
              /\[locale\]/g,
              i18nConfig.locale.source,
            );
            const targetPaths = i18nConfig.locale.targets.map((targetLocale) =>
              pathPattern.replace(/\[locale\]/g, targetLocale),
            );

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
