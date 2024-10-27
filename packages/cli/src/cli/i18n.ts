/*

import { Command } from 'commander';
import Z from 'zod';
import { getConfig } from './../workers/config';
import { getSettings } from './../workers/settings';
import Ora from 'ora';
import _ from 'lodash';
import { bucketTypeSchema, localeCodeSchema } from '@replexica/spec';
import { createLockfileProcessor } from './../workers/lockfile';
import { createAuthenticator } from './../workers/auth';
import { ReplexicaEngine } from '@replexica/sdk';
import { expandPlaceholderedGlob, createBucketLoader } from '../workers/bucket';
import { ensureLockfileExists } from './lockfile';
import { ReplexicaCLIError } from '../utils/errors';

export default new Command()
  .command('i18n')
  .description('Run AI localization engine')
  .helpOption('-h, --help', 'Show help')
  .option('--locale <locale>', 'Locale to process')
  .option('--bucket <bucket>', 'Bucket to process')
  .option('--frozen', `Don't update the translations and fail if an update is needed`)
  .option('--force', 'Ignore lockfile and process all keys')
  .option('--api-key <api-key>', 'Explicitly set the API key to use')
  .action(async function (options) {
    const ora = Ora();
    try {
      ora.start('Loading Replexica configuration');
      const [
        i18nConfig,
        flags,
      ] = await Promise.all([
        getConfig(),
        loadFlags(options),
      ]);
      const settings = await getSettings(flags.apiKey);

      if (!i18nConfig) {
        throw new ReplexicaCLIError({
          message: 'i18n.json not found. Please run `replexica init` to initialize the project.',
          docUrl: "i18nNotFound"
        });
      } else if (!i18nConfig.buckets || !Object.keys(i18nConfig.buckets).length) {
        throw new ReplexicaCLIError({
          message: "No buckets found in i18n.json. Please add at least one bucket containing i18n content.",
          docUrl: "bucketNotFound"
        });
      } else if (flags.locale && !i18nConfig.locale.targets.includes(flags.locale)) {
        throw new ReplexicaCLIError({
          message: `Source locale ${i18nConfig.locale.source} does not exist in i18n.json locale.targets. Please add it to the list and try again.`,
          docUrl: "localeTargetNotFound"
        });
      } else if (flags.bucket && !i18nConfig.buckets[flags.bucket]) {
        throw new ReplexicaCLIError({
          message: `Bucket ${flags.bucket} does not exist in i18n.json. Please add it to the list and try again.`,
          docUrl: "bucketNotFound"
        });
      } else {
        ora.succeed('Replexica configuration loaded');
      }

      ora.start('Ensuring lockfile exists');
      let lockfileResult;
      try {
        lockfileResult = await ensureLockfileExists();
      } catch (error: any) {
        throw new ReplexicaCLIError({
          message: `Failed to ensure lockfile exists: ${error.message}`,
          docUrl: "lockFiletNotFound"
        });
      }
      if (lockfileResult === 'exists') {
        ora.succeed(`Lockfile exists`);
      } else {
        ora.succeed('Lockfile created');
      }

      ora.start('Authenticating');
      const authenticator = createAuthenticator({
        apiKey: settings.auth.apiKey,
        apiUrl: settings.auth.apiUrl,
      });
      const auth = await authenticator.whoami();
      if (!auth) {
        throw new ReplexicaCLIError({
          message: 'Not authenticated',
          docUrl: "authError"
        });
      }

      ora.start('Connecting to Replexica AI engine');
      let replexicaEngine;
      try {
        replexicaEngine = new ReplexicaEngine({
          apiKey: settings.auth.apiKey,
          apiUrl: settings.auth.apiUrl,
        });
      } catch (error: any) {
        throw new ReplexicaCLIError({
          message: `Failed to initialize ReplexicaEngine: ${error.message}`,
          docUrl: "failedReplexicaEngine"
        });
      }
      ora.succeed('Replexica AI engine connected');

      // Determine the exact buckets to process
      const targetedBuckets = flags.bucket ? { [flags.bucket]: i18nConfig.buckets[flags.bucket] } : i18nConfig.buckets;

      // Expand the placeholdered globs into actual (placeholdered) paths
      const placeholderedPathsTuples: [Z.infer<typeof bucketTypeSchema>, string][] = [];
      try {
        for (const [bucketType, bucketTypeParams] of Object.entries(targetedBuckets)) {
          const includedPlaceholderedPaths = bucketTypeParams.include
            .map((placeholderedGlob) => expandPlaceholderedGlob(placeholderedGlob, i18nConfig.locale.source))
            .flat();
          const excludedPlaceholderedPaths = bucketTypeParams.exclude
            ?.map((placeholderedGlob) => expandPlaceholderedGlob(placeholderedGlob, i18nConfig.locale.source))
            .flat() || [];
          const finalPlaceholderedPaths = includedPlaceholderedPaths.filter((path) => !excludedPlaceholderedPaths.includes(path));
          for (const placeholderedPath of finalPlaceholderedPaths) {
            placeholderedPathsTuples.push([
              bucketType as Z.infer<typeof bucketTypeSchema>,
              placeholderedPath
            ]);
          }
        }
      } catch (error: any) {
        throw new ReplexicaCLIError({
          message: `Failed to expand placeholdered globs: ${error.message}`,
          docUrl: "placeHolderFailed"
        });
      }

      const lockfileProcessor = createLockfileProcessor();
      for (const [bucketType, placeholderedPath] of placeholderedPathsTuples) {
        console.log('');
        const bucketOra = Ora({});
        bucketOra.info(`Processing ${placeholderedPath}`);        
        // Load the source locale payload
        const sourcePayload = await createBucketLoader({
          bucketType,
          placeholderedPath,
          locale: i18nConfig.locale.source,
        }).load();
        // Load saved checksums from the lockfile
        const savedChecksums = await lockfileProcessor.loadChecksums(placeholderedPath);
        // Calculate current checksums for the source payload
        const currentChecksums = await lockfileProcessor.createChecksums(sourcePayload);

        // Compare the checksums with the ones stored in the lockfile to determine the updated keys
        const updatedPayload = flags.force
          ? sourcePayload
          : _.pickBy(sourcePayload, (value, key) => savedChecksums[key] !== currentChecksums[key]);

        const targetLocales = flags.locale ? [flags.locale] : i18nConfig.locale.targets;
        for (const targetLocale of targetLocales) {
          const localeOra = Ora({ indent: 2, prefixText: `${i18nConfig.locale.source} -> ${targetLocale}` });
          // Load the source locale and target locale payloads
          const targetBucketFileLoader = createBucketLoader({
            bucketType,
            placeholderedPath,
            locale: targetLocale,
          });
          const targetPayload = await targetBucketFileLoader.load();
          // Calculate the deltas between the source and target payloads
          const newPayload = _.omit(sourcePayload, Object.keys(targetPayload));
          // Calculate the deleted keys between the source and target payloads
          const deletedPayload = _.omit(targetPayload, Object.keys(sourcePayload));
          // Calculate the processable payload to send to the engine
          const processablePayload = _.merge({}, newPayload, updatedPayload);
          const passthroughPayload = _.pickBy(
            processablePayload,
            (_value: any): boolean => {
              const value = String(_value);
              return [
                (v: string) => !isNaN(Date.parse(v)),
                (v: string) => !isNaN(Number(v)),
                (v: string) => ['true', 'false'].includes(v.toLowerCase())
              ].some(fn => fn(value));
            }
          );
          // compose final payload to send to the engine: it's the processable payload except for the passthrough
          const finalPayload = _.omit(processablePayload, Object.keys(passthroughPayload));
          const payloadStats = {
            new: Object.keys(newPayload).length,
            updated: Object.keys(updatedPayload).length,
            deleted: Object.keys(deletedPayload).length,
            processable: Object.keys(processablePayload).length,
            final: Object.keys(finalPayload).length,
          };

          if (flags.frozen && (payloadStats.processable > 0 || payloadStats.deleted > 0)) {
            throw new ReplexicaCLIError({
              message: `Translations are not up to date. Run the command without the --frozen flag to update the translations, then try again.`,
              docUrl: "translationFailed"
            });
          }

          let processedPayload: Record<string, string> = {};
          if (!payloadStats.final) {
            localeOra.succeed('Translations are up to date');
          } else {
            localeOra.info(`Processing ${payloadStats.final} localization entries`);

            try {
              // Use the SDK to localize the payload
              localeOra.start('AI localization in progress...');
              // Calculate reference payload if specified
              const referencePayload: any = {};
              if (i18nConfig.locale.extraSource) {
                let extraSourcePayload = await createBucketLoader({
                  bucketType,
                  placeholderedPath,
                  locale: i18nConfig.locale.extraSource,
                }).load();
                // leave only the keys that are present in the final payload
                extraSourcePayload = _.pick(extraSourcePayload, Object.keys(finalPayload));
                // assign
                referencePayload[i18nConfig.locale.extraSource] = extraSourcePayload;
              }

              processedPayload = await replexicaEngine.localizeObject(
                finalPayload,
                {
                  sourceLocale: i18nConfig.locale.source,
                  targetLocale: targetLocale,
                },
                (progress) => {
                  localeOra.text = `(${progress}%) AI localization in progress...`;
                }
              );

              localeOra.succeed(`AI localization completed`);
            } catch (error: any) {
              localeOra.fail(error.message);
            }
          }
          // Merge the processed payload and the original target payload into a single entity
          const newTargetPayload = _.omit(
            // Here we init an empty object, and first merge source payload and then target payload into it,
            // so when the target/processed payload objects take precedence over the source payload keys/values,
            // the order/position of the keys in the final object matches the order of the keys in the source payload
            _.merge({}, sourcePayload, targetPayload, processedPayload),
            Object.keys(deletedPayload),
          );
          // Save the new target payload
          await targetBucketFileLoader.save(newTargetPayload);
        }
        // Update the lockfile with the new checksums after the process is done
        await lockfileProcessor.saveChecksums(placeholderedPath, currentChecksums);
      }
      // if explicit bucket flag is provided, do not clean up the lockfile,
      // because we might have skipped some buckets, and we don't want to lose the checksums
      if (!flags.bucket) {
        const placeholderedPaths = placeholderedPathsTuples.map(([,placeholderedPath]) => placeholderedPath);
        await lockfileProcessor.cleanupCheksums(placeholderedPaths);
      }

      console.log('');
      ora.succeed('I18n lockfile synced');
    } catch (error: any) {
      ora.fail(error.message);
      process.exit(1);
    }
  });

// Private

async function loadFlags(options: any) {
  return Z.object({
    apiKey: Z.string().optional(),
    locale: localeCodeSchema.optional(),
    bucket: bucketTypeSchema.optional(),
    force: Z.boolean().optional(),
    frozen: Z.boolean().optional(),
  }).parse(options);
}

*/

import { bucketTypeSchema, I18nConfig, localeCodeSchema } from '@replexica/spec';
import { ReplexicaEngine } from '@replexica/sdk';
import { Command } from 'commander';
import Z from 'zod';
import _ from 'lodash';
import { getConfig } from '../workers/config';
import { getSettings } from '../workers/settings';
import { ReplexicaCLIError } from '../utils/errors';
import path from 'path';
import Ora from 'ora';
import * as glob from 'glob';
import fs from 'fs';
import YAML from 'yaml';
import { MD5 } from 'object-hash';
import createBucketLoader from '../loaders';

export default new Command()
  .command('i18n')
  .description('Run AI localization engine')
  .helpOption('-h, --help', 'Show help')
  .option('--locale <locale>', 'Locale to process')
  .option('--bucket <bucket>', 'Bucket to process')
  .option('--frozen', `Don't update the translations and fail if an update is needed`)
  .option('--force', 'Ignore lockfile and process all keys')
  .option('--api-key <api-key>', 'Explicitly set the API key to use')
  .action(async function (options) {
    const ora = Ora();

    ora.start('Loading configuration...');
    const flags = parseFlags(options);
    const i18nConfig = getConfig();
    const settings = getSettings(flags.apiKey);
    ora.succeed('Configuration loaded');

    validateParams(i18nConfig, flags);

    const buckets = getBuckets(i18nConfig!, flags);
    const targetLocales = getTargetLocales(i18nConfig!, flags);
    const lockfileHelper = createLockfileHelper();

    // Ensure the lockfile exists
    ora.start('Ensuring i18n.lock exists...');
    if (!lockfileHelper.isLockfileExists()) {
      ora.start('Creating i18n.lock...');
      for (const bucket of buckets) {
        for (const pathPattern of bucket.pathPatterns) {
          const bucketLoader = createBucketLoader(bucket.type, pathPattern);
          bucketLoader.setDefaultLocale(i18nConfig!.locale.source);

          const sourceData = await bucketLoader.pull(i18nConfig!.locale.source);
          lockfileHelper.registerSourceData(pathPattern, sourceData);
        }
      }
      ora.succeed('i18n.lock created');
    } else {
      ora.succeed('i18n.lock loaded');
    }

    // Process each bucket
    for (const bucket of buckets) {
      for (const pathPattern of bucket.pathPatterns) {
        console.log();
        ora.info(`Processing [${bucket.type}] ${pathPattern}`);

        const bucketLoader = createBucketLoader(bucket.type, pathPattern);
        bucketLoader.setDefaultLocale(i18nConfig!.locale.source);

        const sourceData = await bucketLoader.pull(i18nConfig!.locale.source);
        const updatedSourceData = flags.force ? sourceData :lockfileHelper.extractUpdatedData(pathPattern, sourceData);

        for (const targetLocale of targetLocales) {
          ora.start(`[${i18nConfig!.locale.source} -> ${targetLocale}] AI localization in progress...`);

          const targetData = await bucketLoader.pull(targetLocale);

          const processableData = calculateDataDelta({ sourceData, updatedSourceData, targetData });

          const localizationEngine = createLocalizationEngineConnection({
            apiKey: settings.auth.apiKey,
            apiUrl: settings.auth.apiUrl,
          });
          const processedTargetData = await localizationEngine.process({
            sourceLocale: i18nConfig!.locale.source,
            sourceData,
            processableData,
            targetLocale,
            targetData,
          }, (progress) => {
            ora.text = `[${i18nConfig!.locale.source} -> ${targetLocale}] (${progress}%) AI localization in progress...`;
          });

          await bucketLoader.push(targetLocale, processedTargetData);

          ora.succeed(`[${i18nConfig!.locale.source} -> ${targetLocale}] AI localization completed`);
        }

        lockfileHelper.registerSourceData(pathPattern, sourceData);
      }
    }

    console.log();
    ora.succeed('Done');
  });

function createLockfileHelper() {
  return {
    isLockfileExists: () => {
      const lockfilePath = _getLockfilePath();
      return fs.existsSync(lockfilePath);
    },
    registerSourceData: (pathPattern: string, sourceData: Record<string, any>) => {
      const lockfile = _loadLockfile();

      const sectionKey = MD5(pathPattern);
      const sectionChecksums = _.mapValues(sourceData, (value) => MD5(value));

      lockfile.checksums[sectionKey] = sectionChecksums;

      _saveLockfile(lockfile);
    },
    extractUpdatedData: (pathPattern: string, sourceData: Record<string, any>) => {
      const lockfile = _loadLockfile();

      const sectionKey = MD5(pathPattern);
      const currentChecksums = _.mapValues(sourceData, (value) => MD5(value));

      const savedChecksums = lockfile.checksums[sectionKey] || {};
      const updatedData = _.pickBy(sourceData, (value, key) => savedChecksums[key] !== currentChecksums[key]);

      return updatedData;
    },
  }

  function _loadLockfile() {
    const lockfilePath = _getLockfilePath();
    if (!fs.existsSync(lockfilePath)) {
      return LockfileSchema.parse({});
    }
    const content = fs.readFileSync(lockfilePath, 'utf-8');
    const result = LockfileSchema.parse(YAML.parse(content));
    return result;
  }

  function _saveLockfile(lockfile: Z.infer<typeof LockfileSchema>) {
    const lockfilePath = _getLockfilePath();
    const content = YAML.stringify(lockfile);
    fs.writeFileSync(lockfilePath, content);
  }

  function _getLockfilePath() {
    return path.join(process.cwd(), 'i18n.lock');
  }
}

const LockfileSchema = Z.object({
  version: Z.literal(1).default(1),
  checksums: Z.record(
    Z.string(), // localizable files' keys
    Z.record( // checksums hashmap
      Z.string(), // key
      Z.string() // checksum of the key's value in the source locale
    ).default({}),
  ).default({}),
});

// Private

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

function createLocalizationEngineConnection(args: {
  apiKey: string;
  apiUrl: string;
}) {
  const replexicaEngine = new ReplexicaEngine({
    apiKey: args.apiKey,
    apiUrl: args.apiUrl,
  });

  return {
    process: async (args: {
      sourceLocale: string;
      sourceData: Record<string, any>;
      processableData: Record<string, any>;

      targetLocale: string;
      targetData: Record<string, any>;
    },
      onProgress: (progress: number) => void,
    ) => {
      const result = await replexicaEngine.localizeObject(
        args.processableData,
        { sourceLocale: args.sourceLocale, targetLocale: args.targetLocale },
        onProgress
      );

      return result;
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

function getBuckets(i18nConfig: I18nConfig, flags: ReturnType<typeof parseFlags>) {
  let result = Object
    .entries(i18nConfig.buckets)
    .map(([bucketType, bucketEntry]) => ({
      type: bucketType as Z.infer<typeof bucketTypeSchema>,
      pathPatterns: extractPathPatterns(i18nConfig.locale.source, bucketEntry.include, bucketEntry?.exclude),
    }));

  if (flags.bucket) {
    result = result.filter((bucket) => bucket.type === flags.bucket);
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
  }).parse(options);
}

function validateParams(i18nConfig: I18nConfig | null, flags: ReturnType<typeof parseFlags>) {
  if (!i18nConfig) {
    throw new ReplexicaCLIError({
      message: 'i18n.json not found. Please run `replexica init` to initialize the project.',
      docUrl: "i18nNotFound"
    });
  } else if (!i18nConfig.buckets || !Object.keys(i18nConfig.buckets).length) {
    throw new ReplexicaCLIError({
      message: "No buckets found in i18n.json. Please add at least one bucket containing i18n content.",
      docUrl: "bucketNotFound"
    });
  } else if (flags.locale && !i18nConfig.locale.targets.includes(flags.locale)) {
    throw new ReplexicaCLIError({
      message: `Source locale ${i18nConfig.locale.source} does not exist in i18n.json locale.targets. Please add it to the list and try again.`,
      docUrl: "localeTargetNotFound"
    });
  } else if (flags.bucket && !i18nConfig.buckets[flags.bucket as keyof typeof i18nConfig.buckets]) {
    throw new ReplexicaCLIError({
      message: `Bucket ${flags.bucket} does not exist in i18n.json. Please add it to the list and try again.`,
      docUrl: "bucketNotFound"
    });
  }
}

function extractPathPatterns(
  sourceLocale: string,
  include: string[],
  exclude?: string[],
) {
  const includedPatterns = include.flatMap((pattern) => expandPlaceholderedGlob(pattern, sourceLocale));
  const excludedPatterns = exclude?.flatMap((pattern) => expandPlaceholderedGlob(pattern, sourceLocale));
  const result = _.difference(includedPatterns, excludedPatterns ?? []);
  return result;
}

// Path expansion
function expandPlaceholderedGlob(_pathPattern: string, sourceLocale: string): string[] {
  // Throw if pathPattern is an absolute path
  const absolutePathPattern = path.resolve(_pathPattern);
  const pathPattern = path.relative(process.cwd(), absolutePathPattern);
  // Throw if pathPattern points outside the current working directory
  if (path.relative(process.cwd(), pathPattern).startsWith('..')) {
    throw new ReplexicaCLIError({
      message: `Invalid path pattern: ${pathPattern}. Path pattern must be within the current working directory.`,
      docUrl: "invalidPathPattern"
    });
  }
  // Throw error if pathPattern contains "**" – we don't support recursive path patterns
  if (pathPattern.includes('**')) {
    throw new ReplexicaCLIError({
      message: `Invalid path pattern: ${pathPattern}. Recursive path patterns are not supported.`,
      docUrl: 'invalidPathPattern'
    });
  }
  // Throw error if pathPattern contains "[locale]" several times
  if (pathPattern.split('[locale]').length > 2) {
    throw new ReplexicaCLIError({
      message: `Invalid path pattern: ${pathPattern}. Path pattern must contain at most one "[locale]" placeholder.`,
      docUrl: "invalidPathPattern"
    });
  }
  // Break down path pattern into parts
  const pathPatternChunks = pathPattern.split(path.sep);
  // Find the index of the segment containing "[locale]"
  const localeSegmentIndex = pathPatternChunks.findIndex((segment) => segment.includes('[locale]'));
  // Find the position of the "[locale]" placeholder within the segment
  const localePlaceholderIndex = pathPatternChunks[localeSegmentIndex]?.indexOf('[locale]') ?? -1;
  // substitute [locale] in pathPattern with sourceLocale
  const sourcePathPattern = pathPattern.replace(/\[locale\]/g, sourceLocale);
  // get all files that match the sourcePathPattern
  const sourcePaths = glob
    .sync(sourcePathPattern, { follow: true, withFileTypes: true })
    .filter((file) => file.isFile() || file.isSymbolicLink())
    .map((file) => file.fullpath())
    .map((fullpath) => path.relative(process.cwd(), fullpath));
  // transform each source file path back to [locale] placeholder paths
  const placeholderedPaths = sourcePaths.map((sourcePath) => {
    const sourcePathChunks = sourcePath.split(path.sep);
    if (localeSegmentIndex >= 0 && localePlaceholderIndex >= 0) {
      const placeholderedPathChunk = sourcePathChunks[localeSegmentIndex];
      const placeholderedSegment =
        placeholderedPathChunk.substring(0, localePlaceholderIndex)
        + '[locale]'
        + placeholderedPathChunk.substring(localePlaceholderIndex + sourceLocale.length)
        ;
      sourcePathChunks[localeSegmentIndex] = placeholderedSegment;
    }
    const placeholderedPath = sourcePathChunks.join(path.sep);
    return placeholderedPath;
  });
  // return the placeholdered paths
  return placeholderedPaths;
}
