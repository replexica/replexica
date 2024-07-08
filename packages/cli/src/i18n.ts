import { Command } from 'commander';
import Z from 'zod';
import { loadConfig } from './workers/config';
import { loadSettings } from './workers/settings';
import Ora from 'ora';
import _ from 'lodash';
import { createBucketProcessor } from './workers/bucket';
import { createEngine } from './workers/engine';
import { allLocalesSchema } from '@replexica/spec';
import { createLockfileProcessor } from './workers/lockfile';
import { createAuthenticator } from './workers/auth';

export default new Command()
  .command('i18n')
  .description('Run AI localization engine')
  .helpOption('-h, --help', 'Show help')
  .option('--locale <locale>', 'Locale to process')
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

      ora.start('Connecting to AI localization engine');
      const engine = createEngine({
        apiKey: settings.auth.apiKey,
        apiUrl: settings.auth.apiUrl,
      });
      ora.succeed('AI localization engine connected');

      const lockfileProcessor = createLockfileProcessor();
      for (const [bucketPath, bucketType] of Object.entries(i18nConfig.buckets)) {
        console.log('');
        const bucketOra = Ora({ });
        // Create the payload processor instance for the current bucket type
        const bucketProcessor = createBucketProcessor(bucketType, bucketPath);
        // Load the source locale payload
        const sourcePayload = await bucketProcessor.load(i18nConfig.locale.source);
        // Load saved checksums from the lockfile
        const savedChecksums = await lockfileProcessor.loadChecksums(bucketPath);
        // Calculate current checksums for the source payload
        const currentChecksums = await lockfileProcessor.createChecksums(sourcePayload);
        // Compare the checksums with the ones stored in the lockfile to determine the updated keys
        const updatedPayload = flags.force
          ? sourcePayload
          : _.pickBy(sourcePayload, (value, key) => savedChecksums[key] !== currentChecksums[key]);

        const targetLocales = flags.locale ? [flags.locale] : i18nConfig.locale.targets;
        bucketOra.info(`Processing ${bucketPath}`);

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
          if (payloadStats.total === 0) {
            localeOra.succeed('Translations are up to date');
            continue;
          }
          localeOra.info(`Found ${payloadStats.total} keys (${payloadStats.new} new, ${payloadStats.updated} updated, ${payloadStats.deleted} deleted)`);
          // Split the processable payload into and array of objects, each containing 25 keys max
          const chunkedPayload = _.chunk(Object.entries(processablePayload), 25).map((entries) => _.fromPairs(entries));
          // Process the payload chunks
          const processedPayloadChunks: Record<string, string>[] = [];
          let percentageCompleted = 0;
          for (let i = 0; i < chunkedPayload.length; i++) {
            // Localize the payload chunk
            const chunk = chunkedPayload[i];
            localeOra.start(`AI localization in progress (${percentageCompleted}%)`);
            const processedPayloadChunk = await engine.localize(
              i18nConfig.locale.source, 
              targetLocale,
              { meta: {}, data: chunk },
            );
            // Add the processed payload chunk to the list with the rest of the processed chunks
            processedPayloadChunks.push(processedPayloadChunk);
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
    }
  });

// Private

async function loadFlags(options: any) {
  return Z.object({
    locale: allLocalesSchema.optional(),
    force: Z.boolean().optional(),
  }).parse(options);
}
