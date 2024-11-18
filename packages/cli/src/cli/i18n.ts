import { bucketTypeSchema, I18nConfig, localeCodeSchema } from '@replexica/spec';
import { ReplexicaEngine } from '@replexica/sdk';
import { Command } from 'commander';
import Z, { any } from 'zod';
import _ from 'lodash';
import { getConfig } from '../utils/config';
import { getSettings } from '../utils/settings';
import { ReplexicaCLIError } from '../utils/errors';
import Ora from 'ora';
import createBucketLoader from '../loaders';
import { createLockfileHelper } from '../utils/lockfile';
import { createAuthenticator } from '../utils/auth';
import { getBuckets } from '../utils/buckets';

export default new Command()
  .command('i18n')
  .description('Run AI localization engine')
  .helpOption('-h, --help', 'Show help')
  .option('--locale <locale>', 'Locale to process')
  .option('--bucket <bucket>', 'Bucket to process')
  .option('--frozen', `Don't update the translations and fail if an update is needed`)
  .option('--force', 'Ignore lockfile and process all keys')
  .option('--verbose', 'Show verbose output')
  .option('--api-key <api-key>', 'Explicitly set the API key to use')
  .option('--strict', 'Stop on first error')
  .action(async function (options) {
    const ora = Ora();
    const results: any = [];
    const flags = parseFlags(options);
    
    try {
      ora.start('Loading configuration...');
      const i18nConfig = getConfig();
      const settings = getSettings(flags.apiKey);
      ora.succeed('Configuration loaded');
      
      try {
        ora.start('Validating localization configuration...');
        validateParams(i18nConfig, flags);
        ora.succeed('Localization configuration is valid');
      } catch (error:any) {
        handleWarning('Localization configuration validation failed', error, true, results);
        return;
      }

      try {
        ora.start('Connecting to Replexica Localization Engine...');
        const auth = await validateAuth(settings);
        ora.succeed(`Authenticated as ${auth.email}`);
      } catch (error:any) {
        handleWarning('Failed to connect to Replexica Localization Engine', error, true, results);
        return;
      }

      let buckets:any = [];
      try {
        buckets = getBuckets(i18nConfig!);
        if (flags.bucket) {
          buckets = buckets.filter((bucket:any) => bucket.type === flags.bucket);
        }
        ora.succeed('Buckets retrieved');
      } catch (error:any) {
        handleWarning('Failed to retrieve buckets', error, true, results);
        return;
      }

      const targetLocales = getTargetLocales(i18nConfig!, flags);
      const lockfileHelper = createLockfileHelper();

      // Ensure the lockfile exists
      try {
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
      } catch (error:any) {
        handleWarning('Failed to ensure i18n.lock existence', error, true, results);
        return;
      }

      if(flags.frozen){

        ora.start('Checking for lockfile updates...');
        
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

            const sourceData = await bucketLoader.pull(i18nConfig!.locale.source);
            const updatedSourceData = flags.force ? sourceData : lockfileHelper.extractUpdatedData(pathPattern, sourceData);

            for (const targetLocale of targetLocales) {
              try {
                bucketOra.start(`[${i18nConfig!.locale.source} -> ${targetLocale}] (0%) AI localization in progress...`);
                
                const targetData = await bucketLoader.pull(targetLocale);
                const processableData = calculateDataDelta({ sourceData, updatedSourceData, targetData });
                if (flags.verbose) {
                  bucketOra.info(JSON.stringify(processableData, null, 2));
                }

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
                  bucketOra.text = `[${i18nConfig!.locale.source} -> ${targetLocale}] (${progress}%) AI localization in progress...`;
                });

                if (flags.verbose) {
                  bucketOra.info(JSON.stringify(processedTargetData, null, 2));
                }

                const finalTargetData = _.pick(
                  _.merge({}, sourceData, targetData, processedTargetData),
                  Object.keys(sourceData)
                );
                await bucketLoader.push(targetLocale, finalTargetData);
                bucketOra.succeed(`[${i18nConfig!.locale.source} -> ${targetLocale}] AI localization completed`);
              } catch (error:any) {
                handleWarning(`Failed to localize for ${targetLocale}`, error, flags.strict, results);
                if (flags.strict) return;
              }
            }
            lockfileHelper.registerSourceData(pathPattern, sourceData);
          }
        } catch (error:any) {
          handleWarning(`Failed to process bucket: ${bucket.type}`, error, flags.strict, results);
          if (flags.strict) return;
        }
      }

      console.log();
      ora.succeed('AI localization completed!');
    } catch (error: any) {
      ora.fail(error.message);
      process.exit(1);
    } finally {
      displaySummary(results);
    }
  });


function handleWarning(step: string, error: Error, strictMode: boolean| undefined, results: any[]) {
  console.warn(`[WARNING] ${step}: ${error.message}`);
  results.push({ step, status: "Failed", error: error.message });
  if (strictMode) throw error;
}

function displaySummary(results: any[]) {
  if (results.length === 0) { return; }

  console.log("\nProcess Summary:");
  results.forEach((result) => {
    console.log(`${result.step}: ${result.status}`);
    if (result.error) console.log(`  - Error: ${result.error}`);
  });
}

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

function parseFlags(options: any) {
  return Z.object({
    apiKey: Z.string().optional(),
    locale: localeCodeSchema.optional(),
    bucket: bucketTypeSchema.optional(),
    force: Z.boolean().optional(),
    frozen: Z.boolean().optional(),
    verbose: Z.boolean().optional(),
    strict: Z.boolean().optional(),
  }).parse(options);
}

async function validateAuth(settings: ReturnType<typeof getSettings>) {
  if (!settings.auth.apiKey) {
    throw new ReplexicaCLIError({
      message: 'Not authenticated. Please run `replexica auth --login` to authenticate.',
      docUrl: "authError"
    });
  }

  const authenticator = createAuthenticator({
    apiKey: settings.auth.apiKey,
    apiUrl: settings.auth.apiUrl,
  });
  const user = await authenticator.whoami();
  if (!user) {
    throw new ReplexicaCLIError({
      message: 'Invalid API key. Please run `replexica auth --login` to authenticate.',
      docUrl: "authError"
    });
  }

  return user;
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
