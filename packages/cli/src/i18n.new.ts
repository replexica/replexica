import { Command } from 'commander';
import Z from 'zod';
import { loadConfig } from './workers/config';
import { loadSettings } from './workers/settings';
import Ora from 'ora';
import _ from 'lodash';
import { MD5 } from 'object-hash';
import { loadLockfile, updateLockfile } from './workers/lockfile';
import { createBucketProcessor } from './workers/bucket';

export default new Command()
  .command('i18n-new')
  .description('Process i18n with Replexica')
  .helpOption('-h, --help', 'Show help')
  .action(async function(options) {
    try {
      const [settings, i18nConfig, flags, lockfile] = await Promise.all([
        loadSettings(),
        loadConfig(),
        loadFlags(options),
        loadLockfile(),
      ]);
  
      if (!i18nConfig) {
        throw new Error('i18n.json not found. Please run `replexica init` to initialize the project.');
      }

      if (!i18nConfig.buckets) {
        throw new Error('No buckets found in i18n.json. Please add at least one bucket containing i18n content.');
      }

      let engine: any;

      for (const [bucketPath, bucketType] of Object.entries(i18nConfig.buckets)) {
        // Create the payload processor instance for the current bucket type
        const bucketProcessor = createBucketProcessor(bucketType, bucketPath);
        // Load the source locale payload
        const sourcePayload = await bucketProcessor.load(i18nConfig.locale.source);
        // Calculate the checksums for the source payload
        const currentChecksums = _.mapValues(sourcePayload, (value) => MD5(value));
        // Compare the checksums with the ones stored in the lockfile to determine the updated keys
        const updatedPayload = _.pickBy(lockfile.checksums, (value, key) => currentChecksums[key] !== value);

        for (const targetLocale of i18nConfig.locale.targets) {
          // Load the source locale and target locale payloads
          const targetPayload = await bucketProcessor.load(targetLocale);
          // Calculate the deltas between the source and target payloads
          const newPayload = _.omit(sourcePayload, Object.keys(targetPayload));
          // Calculate the processable payload to send to the engine
          const processablePayload = _.merge(newPayload, updatedPayload);
          // Split the processable payload into and array of objects, each containing 25 keys max
          const chunkedPayload = _.chunk(Object.entries(processablePayload), 25).map((entries) => _.fromPairs(entries));
          // Process the payload chunks
          const processedPayloadChunks: Record<string, string>[] = [];
          for (const chunk of chunkedPayload) {
            const processedPayloadChunk = await engine.processPayload(chunk, i18nConfig.locale.source, targetLocale);
            processedPayloadChunks.push(processedPayloadChunk);
          }
          // Calculate the deleted keys between the source and target payloads
          const deletedPayload = _.omit(sourcePayload, Object.keys(targetPayload));
          // Merge the processed payload chunks and the original target payload into a single entity
          const newTargetPayload = _.omit(
            _.merge(targetPayload, ...processedPayloadChunks),
            Object.keys(deletedPayload),
          )
          // Save the new target payload
          await bucketProcessor.save(targetLocale, newTargetPayload);
        }
        // Update the lockfile with the new checksums after the process is done
        await updateLockfile((lockfile) => _.merge({}, lockfile, { checksums: currentChecksums }));
      }
    } catch (error: any) {
      Ora().fail(error.message);
    }
  });

// Private

async function loadFlags(options: any) {
  return Z.object({
    cacheOnly: Z.boolean().optional(),
    skipCache: Z.boolean().optional(),
    locale: Z.string().optional(),
  }).parse(options);
}
