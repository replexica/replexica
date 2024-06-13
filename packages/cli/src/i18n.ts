import { Command } from 'commander';
import Ora from 'ora';
import Z from 'zod';
import { loadConfig, saveConfig } from './services/config';
import { createBucketProcessor, createTranslator } from './services/bucket/core';
import { loadSettings } from './services/settings';
import { loadAuth } from './services/auth';
import { defaultConfig } from '@replexica/spec';

export default new Command()
  .command('i18n')
  .description('Process i18n with Replexica')
  .helpOption('-h, --help', 'Show help')
  .option('--cache-only', 'Only use cached data, and fail if there is new i18n data to process')
  .option('--skip-cache', 'Skip using cached data and process all i18n data')
  .option('--locale <locale>', 'Locale to process')
  .action(async (options) => {
    let spinner = Ora();

    try {
      const flags = await loadFlags(options);
      const settings = await loadSettings();
      const config = await loadConfiguration();

      spinner = Ora().start('Authenticating...');
      const auth = await loadAuth({
        apiUrl: settings.auth.apiUrl,
        apiKey: settings.auth.apiKey!,
      });
      spinner.succeed(`Authenticated as ${auth.email}.`);

      const sourceLocale = config.locale.source;
      let targetLocales = config.locale.targets;
      const bucketEntries = Object.entries(config.buckets!);

      if (flags.locale) {
        if (!targetLocales.includes(flags.locale as any)) {
          spinner.warn(`Target locale ${flags.locale} not found in configuration. Skipping...`);
          targetLocales = [];
        } else {
          targetLocales = [flags.locale as any];
        }
      }
      if (!targetLocales.length) {
        spinner.warn('No target locales found in configuration. Please add at least one target locale.');
      } else if (!bucketEntries.length) {
        spinner.warn('No buckets found in configuration. Please add at least one bucket.');
      } else {
        for (const [bucketPath, bucketType] of bucketEntries) {
          let spinnerPrefix = `[${bucketType}]`;
          if (bucketPath) { spinnerPrefix += `(${bucketPath})`; }
          const bucketSpinner = Ora({ prefixText: spinnerPrefix });

          for (const targetLocale of targetLocales) {
            bucketSpinner.start(`Translating from ${sourceLocale} to ${targetLocale}...`);
            const translatorFn = createTranslator({
              apiUrl: settings.auth.apiUrl,
              apiKey: settings.auth.apiKey!,
              skipCache: flags.skipCache,
              cacheOnly: flags.cacheOnly,
            });
            const processor = createBucketProcessor(bucketType, bucketPath, translatorFn);
  
            const translatable = await processor.load(sourceLocale);
            const translated = await processor.translate(translatable, sourceLocale, targetLocale, progress => {
              bucketSpinner.text = `Translating from ${sourceLocale} to ${targetLocale}... ${progress.toFixed(1)}%`;
            });
  
            await processor.save(targetLocale, translated);
            bucketSpinner.succeed(`Translation from ${sourceLocale} to ${targetLocale} completed.`);
          }
          bucketSpinner.succeed(`Bucket translated.`);
        }
        spinner = Ora().succeed('Translations completed successfully!');
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
      locale: Z.string().optional(),
    })
      .passthrough()
      .parse(options);
    return flags;
  } catch {
    throw new Error(`Couldn't parse flags. Please check your input and try again.`)
  }
}

async function loadConfiguration() {
  const spinner = Ora().start('Loading i18n configuration...');
  let config = await loadConfig();
  if (!config) {
    config = defaultConfig;
    spinner.succeed('No i18n.json config found. Using default configuration.');
  } else {
    spinner.succeed('Configuration loaded.');
  }
  return config;
}
