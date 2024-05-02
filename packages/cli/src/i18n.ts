import { Command } from 'commander';
import Ora from 'ora';
import { getEnv } from './services/env.js';
import Z from 'zod';
import { loadConfig } from './services/config.js';
import { createBucketProcessor } from './services/bucket/core.js';
import { createTranslator } from './services/translator.js';
import { loadSettings } from './services/settings.js';
import { loadAuth } from './services/auth.js';

export default new Command()
  .command('i18n')
  .description('Process i18n with Replexica')
  .helpOption('-h, --help', 'Show help')
  .option('--cache-only', 'Only use cached data, and fail if there is new i18n data to process')
  .option('--skip-cache', 'Skip using cached data and process all i18n data')
  .action(async (options) => {
    let spinner = Ora();

    try {
      const flags = await loadFlags(options);
      const settings = await loadSettings();
      const env = getEnv();
      const config = await loadConfiguration();

      spinner = Ora().start('Authenticating...');
      const auth = await loadAuth({
        apiUrl: env.REPLEXICA_API_URL,
        apiKey: settings.auth.apiKey!,
      });
      spinner.succeed(`Authenticated as ${auth.email}.`);


      const sourceLocale = config.locale.source;
      const targetLocales = config.locale.targets;
      const bucketEntries = Object.entries(config.buckets!);

      if (!targetLocales.length) {
        spinner.warn('No target locales found in configuration. Please add at least one target locale.');
      } else if (!bucketEntries.length) {
        spinner.warn('No buckets found in configuration. Please add at least one bucket.');
      } else {
        spinner = Ora().start(`Translating ${bucketEntries.length} buckets to ${targetLocales.length} locales...`);
        for (const [bucketPath, bucketType] of bucketEntries) {
          let spinnerPrefix = `[${bucketType}]`;
          if (bucketPath) { spinnerPrefix += `(${bucketPath})`; }
          const bucketSpinner = Ora({ prefixText: spinnerPrefix });

          for (const targetLocale of targetLocales) {
            bucketSpinner.start(`Translating from ${sourceLocale} to ${targetLocale}...`);
            const translatorFn = createTranslator({
              apiUrl: env.REPLEXICA_API_URL,
              apiKey: settings.auth.apiKey!,
              skipCache: flags.skipCache,
              cacheOnly: flags.cacheOnly,
            });
            const processor = createBucketProcessor(bucketType, bucketPath, translatorFn);
  
            const translatable = await processor.load(sourceLocale);
            const translated = await processor.translate(translatable, sourceLocale, targetLocale);
  
            await processor.save(targetLocale, translated);
            bucketSpinner.succeed(`Translation from ${sourceLocale} to ${targetLocale} completed.`);
          }
          bucketSpinner.succeed(`Bucket translated.`);
        }
        spinner.succeed('Translations completed successfully!');
      }
    } catch (error: any) {
      spinner.fail(error.message);
      return process.exit(1);
    }
  });


async function loadFlags(options: any) {
  try {
    const flags = Z.object({
      cacheOnly: Z.boolean().optional().default(false),
      skipCache: Z.boolean().optional().default(false),
    })
      .passthrough()
      .parse(options);
    return flags;
  } catch {
    throw new Error(`Couldn't parse flags. Please check your input and try again.`)
  }
}

async function loadConfiguration() {
  const config = await loadConfig();
  if (!config) {
    throw new Error(`Couldn't load i18n configuration. Please run 'replexica init' to initialize your Replexica project.`);
  }
  return config;
}
