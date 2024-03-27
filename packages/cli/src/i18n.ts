import { Command } from 'commander';
import Ora from 'ora';
import { getEnv } from './services/env.js';
import path from 'path';
import fs from 'fs/promises';

const buildDataDir = path.resolve(process.cwd(), 'node_modules', '@replexica/translations');
const buildDataFilePath = path.resolve(buildDataDir, '.replexica.json');

export default new Command()
  .command('i18n')
  .description('Process i18n with Replexica')
  .helpOption('-h, --help', 'Show help')
  .action(async () => {
    const initSpinner = Ora();
    initSpinner.start('Loading Replexica build data...');
    const buildData = await loadBuildData();
    if (!buildData) {
      initSpinner.fail(`Couldn't load Replexica build data. Did you forget to run 'replexica i18n'?`);
      return process.exit(1);
    }

    const localeSource = buildData.settings?.locale?.source;
    if (!localeSource) {
      initSpinner.fail(`No source locale found in Replexica build data. Please check your Replexica configuration and run 'replexica i18n' again.`);
      return process.exit(1);
    }

    const localeTargets = buildData.settings?.locale?.targets || [];
    if (!localeTargets.length) {
      initSpinner.fail(`No target locales found in Replexica build data. Please check your Replexica configuration and run 'replexica i18n' again.`);
      return process.exit(1);
    }

    const localeSourceData = await loadLocaleData(localeSource);
    if (!localeSourceData) {
      initSpinner.fail(`Couldn't load source locale data for source locale ${localeSource}. Did you forget to run 'replexica i18n'?`);
      return process.exit(1);
    }

    initSpinner.succeed('Replexica build data loaded!');

    for (const target of localeTargets) {
      const targetSpinner = Ora();
      targetSpinner.start(`Processing i18n for ${target}...`);
      const result = await processI18n(
        { source: localeSource, target },
        buildData.meta,
        localeSourceData,
      );
      targetSpinner.succeed(`i18n processed for ${target}!`);

      targetSpinner.start(`Saving full i18n data for ${target}...`);
      await saveFullLocaleData(target, result.data);
      targetSpinner.succeed(`Full i18n data saved for ${target}!`);

      targetSpinner.start(`Saving client i18n data for ${target}...`);
      await saveClientLocaleData(target, result.data, buildData.meta);
      targetSpinner.succeed(`Client i18n data saved for ${target}!`);
    }

    initSpinner.succeed('Replexica i18n processing complete!');
  });

async function processI18n(
  locale: { source: string, target: string },
  meta: any,
  data: any,
) {
  const env = getEnv();

  const res = await fetch(`${env.REPLEXICA_API_URL}/i18n`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.REPLEXICA_API_KEY}`,
    },
    body: JSON.stringify({
      locale,
      meta,
      data,
    }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to process i18n: ${errorText}`);
  }
  const payload = await res.json();
  return payload;
}

async function loadBuildData() {
  const fileExists = await fs.access(
    buildDataFilePath,
    fs.constants.F_OK,
  ).then(() => true).catch(() => false);
  if (!fileExists) { return null; }

  const buildDataFile = await fs.readFile(buildDataFilePath, 'utf-8');
  const buildData = JSON.parse(buildDataFile);
  return buildData;
}

async function loadLocaleData(locale: string) {
  const localeFilePath = path.resolve(buildDataDir, `${locale}.json`);
  const fileExists = await fs.access(
    localeFilePath,
    fs.constants.F_OK,
  ).then(() => true).catch(() => false);
  if (!fileExists) { return null; }

  const localeFile = await fs.readFile(localeFilePath, 'utf-8');
  const localeData = JSON.parse(localeFile);
  return localeData;
}

async function saveFullLocaleData(locale: string, data: any) {
  const localeFilePath = path.resolve(buildDataDir, `${locale}.json`);
  await fs.writeFile(localeFilePath, JSON.stringify(data, null, 2));
}

async function saveClientLocaleData(locale: string, data: any, meta: any) {
  const newData = {
    ...data,
  };

  for (const [fileId, fileData] of Object.entries(meta.files || {})) {
    const isClient = (fileData as any).isClient;

    if (!isClient) {
      delete newData[fileId];
    }
  }

  const localeFilePath = path.resolve(buildDataDir, `${locale}.client.json`);
  await fs.writeFile(localeFilePath, JSON.stringify(newData, null, 2));
}
