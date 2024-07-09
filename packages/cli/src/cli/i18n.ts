import { Command } from 'commander';
import Z from 'zod';
import { loadConfig } from './../workers/config';
import { loadSettings } from './../workers/settings';
import Ora from 'ora';
import _ from 'lodash';
import { createBucketProcessor } from './../workers/bucket';
import { createEngine } from './../workers/engine';
import { targetLocaleSchema } from '@replexica/spec';
import { createLockfileProcessor } from './../workers/lockfile';
import { createAuthenticator } from './../workers/auth';

export default new Command()
  .command('i18n')
  .description('Run AI localization engine')
  .helpOption('-h, --help', 'Show help')
  .option('--locale <locale>', 'Locale to process')
  .option('--bucket <bucket>', 'Bucket to process')
  .option('--frozen', `Don't update the translations and fail if an update is needed`)
  .option('--force', 'Ignore lockfile and process all keys')
  .action(async function(options) {
    const ora = Ora();
    try {
      ora.start('Loading Replexica configuration');
      const [
        settings, 
        i18nConfig, 
        flags, 
      ] = await Promise.all([
        loadSettings(),
        loadConfig(),
        loadFlags(options),
      ]);
  
      if (!i18nConfig) {
        throw new Error('i18n.json not found. Please run `replexica init` to initialize the project.');
      } else if (!i18nConfig.buckets || !Object.keys(i18nConfig.buckets).length) {
        throw new Error('No buckets found in i18n.json. Please add at least one bucket containing i18n content.');
      } else if (flags.locale && !i18nConfig.locale.targets.includes(flags.locale)) {
        throw new Error(`Source locale ${i18nConfig.locale.source} does not exist in i18n.json locale.targets. Please add it to the list and try again.`);
      } else if (flags.bucket && !i18nConfig.buckets[flags.bucket]) {
        throw new Error(`Bucket ${flags.bucket} does not exist in i18n.json. Please add it to the list and try again.`);
      } else {
        ora.succeed('Replexica configuration loaded');
      }

      ora.start('Connecting to AI localization engine');
      const authenticator = createAuthenticator({
        apiKey: settings.auth.apiKey,
        apiUrl: settings.auth.apiUrl,
      });
      const auth = await authenticator.whoami();
      if (!auth) {
        throw new Error('Not authenticated');
      }
      ora.succeed(`Authenticated as ${auth.email}`);
      if (auth.isInWaitlist) {
        throw new Error(`Account is not yet activated. Please enable your free trial by talking to our dev team. https://replexica.com/go/demo`);
      }

      ora.start('Connecting to AI localization engine');
      const engine = createEngine({
        apiKey: settings.auth.apiKey,
        apiUrl: settings.auth.apiUrl,
      });
      ora.succeed('AI localization engine connected');

      const lockfileProcessor = createLockfileProcessor();
      const targetedBuckets = flags.bucket ? { [flags.bucket]: i18nConfig.buckets[flags.bucket] } : i18nConfig.buckets;
      for (const [bucketPath, bucketType] of Object.entries(targetedBuckets)) {
        console.log('');
        const bucketOra = Ora({ });
        bucketOra.info(`Processing ${bucketPath}`);
        // Create the payload processor instance for the current bucket type
        const bucketProcessor = createBucketProcessor(bucketType, bucketPath);
        // Load saved checksums from the lockfile
        const savedChecksums = await lockfileProcessor.loadChecksums(bucketPath);
        // Load the source locale payload
        const sourcePayload = await bucketProcessor.load(i18nConfig.locale.source);
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
          const targetPayload = await bucketProcessor.load(targetLocale);
          // Calculate the deltas between the source and target payloads
          const newPayload = _.omit(sourcePayload, Object.keys(targetPayload));
          // Calculate the deleted keys between the source and target payloads
          const deletedPayload = _.omit(targetPayload, Object.keys(sourcePayload));
          // Calculate the processable payload to send to the engine
          const processablePayload = _.merge({}, newPayload, updatedPayload);
          const payloadStats = {
            new: Object.keys(newPayload).length,
            updated: Object.keys(updatedPayload).length,
            deleted: Object.keys(deletedPayload).length,
            total: Object.keys(processablePayload).length,
          };
          if (flags.frozen && (payloadStats.total > 0 || payloadStats.deleted > 0)) {
            throw new Error(`Translations are not up to date. Run the command without the --frozen flag to update the translations, then try again.`);
          }
          if (payloadStats.total === 0) {
            localeOra.succeed('Translations are up to date');
            continue;
          }
          localeOra.info(`Found ${payloadStats.total} keys (${payloadStats.new} new, ${payloadStats.updated} updated, ${payloadStats.deleted} deleted)`);
          // Split the processable payload into and array of objects, each containing 25 keys max
          const chunkedPayload = _extractPayloadChunks(processablePayload);
          // Process the payload chunks
          const processedPayloadChunks: Record<string, string>[] = [];
          for (let i = 0; i < chunkedPayload.length; i++) {
            try {
              // Localize the payload chunk
              const chunk = chunkedPayload[i];
              const percentageCompleted = Math.round(((i + 1) / chunkedPayload.length) * 100);
              localeOra.start(`(${percentageCompleted}%) AI localization in progress`);
              const processedPayloadChunk = await engine.localize(
                i18nConfig.locale.source, 
                targetLocale,
                { meta: {}, data: chunk },
              );
              // Add the processed payload chunk to the list with the rest of the processed chunks
              processedPayloadChunks.push(processedPayloadChunk);
            } catch (error: any) {
              localeOra.fail(error.message);
            }
          }
          localeOra.succeed(`AI localization completed`);
          // Merge the processed payload chunks and the original target payload into a single entity
          const newTargetPayload = _.omit(
            _.merge(targetPayload, ...processedPayloadChunks),
            Object.keys(deletedPayload),
          )
          // Save the new target payload
          await bucketProcessor.save(targetLocale, newTargetPayload);
        }
        // Update the lockfile with the new checksums after the process is done
        bucketOra.start('Updating i18n lockfile');
        await lockfileProcessor.saveChecksums(bucketPath, currentChecksums);
        bucketOra.succeed('I18n lockfile updated');
      }
      await lockfileProcessor.cleanupCheksums(Object.keys(i18nConfig.buckets));
    } catch (error: any) {
      ora.fail(error.message);
      process.exit(1);
    }
  });

// Private

function _extractPayloadChunks(payload: Record<string, string>): Record<string, string>[] {
  // Split the key-value payload into an array of key-value sub-payloads.
  // Each of the sub-payloads' sum of values' words counts be roughly 1000: during the loop,
  // whenever the word count of the current sub-payload exceeds 1000, the current key-value pair
  // must be the last one in the current sub-payload, and the next key-value pair must go into a new sub-payload.
  const result: Record<string, string>[] = [];

  let currentChunk: Record<string, string> = {};
  let currentChunkWordCount = 0;
  for (const [key, value] of Object.entries(payload)) {
    const valueWordCount = _countWordsInChunks(value);
    if (currentChunkWordCount + valueWordCount > 200) {
      result.push(currentChunk);
      currentChunk = {};
      currentChunkWordCount = 0;
    }
    currentChunk[key] = value;
    currentChunkWordCount += valueWordCount;
  }

  if (Object.keys(currentChunk).length > 0) {
    result.push(currentChunk);
  }

  return result;
}

async function loadFlags(options: any) {
  return Z.object({
    locale: targetLocaleSchema.optional(),
    bucket: Z.string().optional(),
    force: Z.boolean().optional(),
    frozen: Z.boolean().optional(),
  }).parse(options);
}

function _countWordsInChunks(payload: any | Record<string, any> | Array<any>): number {
  if (_.isArray(payload)) {
    return payload.reduce((acc, item) => acc + _countWordsInChunks(item), 0);
  } else if (_.isObject(payload)) {
    return Object.values(payload).reduce((acc, item) => acc + _countWordsInChunks(item), 0);
  } else if (_.isString(payload)) {
    return payload.trim().split(' ').filter(Boolean).length;
  } else {
    return 0;
  }
}
