import { Command } from 'commander';
import Z from 'zod';
import { loadConfig } from './../workers/config';
import { loadSettings } from './../workers/settings';
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
        loadConfig(),
        loadFlags(options),
      ]);
      const settings = await loadSettings(flags.apiKey);

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
