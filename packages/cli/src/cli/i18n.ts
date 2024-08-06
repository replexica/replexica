import { Command } from 'commander';
import Z from 'zod';
import { loadConfig } from './../workers/config';
import { loadSettings } from './../workers/settings';
import Ora from 'ora';
import _ from 'lodash';
import { createBucketProcessor } from './../workers/bucket';
import { targetLocaleSchema } from '@replexica/spec';
import { createLockfileProcessor } from './../workers/lockfile';
import { createAuthenticator } from './../workers/auth';
import { ReplexicaEngine } from '@replexica/sdk';
// import fs from 'fs';
// import path from 'path';

export default new Command()
  .command('i18n')
  .description('Run AI localization engine')
  .helpOption('-h, --help', 'Show help')
  .option('--locale <locale>', 'Locale to process')
  .option('--bucket <bucket>', 'Bucket to process')
  .option('--frozen', `Don't update the translations and fail if an update is needed`)
  .option('--force', 'Ignore lockfile and process all keys')
  .action(async function (options) {
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

      // ora.start('Deleting redundant i18n files');
      // let i18nLocales = [i18nConfig.locale.source, ...i18nConfig.locale.targets]
      // for (const bucketPath of Object.keys(i18nConfig.buckets)) {
      //   let directory = bucketPath.substring(0, bucketPath.lastIndexOf('/'));
      //   let parentDir = path.join(process.cwd(), directory);

      //   fs.readdirSync(parentDir).forEach(file => {
      //     let fileName = file.substring(file.lastIndexOf('/') + 1);
      //     let locale = fileName.substring(0, fileName.indexOf('.'));
      //     const exists = i18nLocales.includes(locale);
      //     if (!exists) {
      //       let dir = parentDir + "/" + file;
      //       fs.unlinkSync(dir);
      //     }
      //   })
      // }
      // ora.succeed('Redundant i18n files deleted')

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
        throw new Error(`Account is not yet activated. Please enable your free trial by talking to our dev team. https://replexica.com/go/call`);
      }

      ora.start('Connecting to AI localization engine');
      const replexicaEngine = new ReplexicaEngine({
        apiKey: settings.auth.apiKey,
        apiUrl: settings.auth.apiUrl,
      });
      ora.succeed('AI localization engine connected');

      const lockfileProcessor = createLockfileProcessor();
      const targetedBuckets = flags.bucket ? { [flags.bucket]: i18nConfig.buckets[flags.bucket] } : i18nConfig.buckets;
      for (const [bucketPath, bucketType] of Object.entries(targetedBuckets)) {
        console.log('');
        const bucketOra = Ora({});
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
            processable: Object.keys(processablePayload).length,
          };

          if (flags.frozen && (payloadStats.processable > 0 || payloadStats.deleted > 0)) {
            throw new Error(`Translations are not up to date. Run the command without the --frozen flag to update the translations, then try again.`);
          }

          let processedPayload: Record<string, string> = {};
          if (!payloadStats.processable) {
            localeOra.succeed('Translations are up to date');
          } else {
            localeOra.info(`Found ${payloadStats.processable} keys (${payloadStats.new} new, ${payloadStats.updated} updated, ${payloadStats.deleted} deleted)`);

            try {
              // Use the SDK to localize the payload
              localeOra.start('AI translation in progress...');
              processedPayload = await replexicaEngine.localize(
                processablePayload,
                {
                  sourceLocale: i18nConfig.locale.source,
                  targetLocale: targetLocale,
                },
                (progress) => {
                  localeOra.text = `(${progress}%) AI translation in progress...`;
                }
              );

              localeOra.succeed(`AI translation completed`);
            } catch (error: any) {
              localeOra.fail(error.message);
            }
          }
          // Merge the processed payload and the original target payload into a single entity
          const newTargetPayload = _.omit(
            _.merge(targetPayload, processedPayload),
            Object.keys(deletedPayload),
          );
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

async function loadFlags(options: any) {
  return Z.object({
    locale: targetLocaleSchema.optional(),
    bucket: Z.string().optional(),
    force: Z.boolean().optional(),
    frozen: Z.boolean().optional(),
  }).parse(options);
}