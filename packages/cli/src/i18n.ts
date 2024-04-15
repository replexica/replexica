import { Command } from 'commander';
import Ora from 'ora';
import { getEnv } from './services/env.js';
import path from 'path';
import fs from 'fs/promises';
import { createId } from '@paralleldrive/cuid2';
import { checkAuth } from './services/check-auth.js';
import { loadApiKey } from './services/api-key.js';

const buildDataDir = path.resolve(process.cwd(), 'node_modules', '@replexica/translations');
const buildDataFilePath = path.resolve(buildDataDir, '.replexica.json');

export default new Command()
  .command('i18n')
  .description('Process i18n with Replexica')
  .helpOption('-h, --help', 'Show help')
  .option('--cache-only', 'Only use cached data, and fail if there is new i18n data to process')
  .action(async (options) => {
    const spinner = Ora();

    try {
      const authStatus = await checkAuth();
      if (!authStatus) {
        return process.exit(1);
      }
  
      spinner.start('Loading Replexica build data...');
      const buildData = await loadBuildData();
      if (!buildData) {
        spinner.fail(`Couldn't load Replexica build data. Did you forget to build your app?`);
        return process.exit(1);
      }
  
      const localeSource = buildData.settings?.locale?.source;
      if (!localeSource) {
        spinner.fail(`No source locale found in Replexica build data. Please check your Replexica configuration and try again.`);
        return process.exit(1);
      }
  
      const localeTargets = buildData.settings?.locale?.targets || [];
      if (!localeTargets.length) {
        spinner.fail(`No target locales found in Replexica build data. Please check your Replexica configuration and try again.`);
        return process.exit(1);
      }
  
      const localeSourceData = await loadLocaleData(localeSource);
      if (!localeSourceData) {
        spinner.fail(`Couldn't load source locale data for source locale ${localeSource}. Did you forget to build your app?`);
        return process.exit(1);
      }
  
      spinner.succeed('Replexica data loaded!');
  
      const workflowId = createId();
      for (let i = 0; i < localeTargets.length; i++) {
        const targetLocale = localeTargets[i];
        const resultData: any = {};
  
        const localeEntries = Object.entries(localeSourceData || {});
        for (let j = 0; j < localeEntries.length; j++) {
          const [localeFileId, localeFileData] = localeEntries[j];
          spinner.start(`[${targetLocale}] Processing file ${j + 1}/${localeEntries.length}...`);
  
          const partialLocaleData = { [localeFileId]: localeFileData };
          const result = await processI18n(
            { workflowId, cacheOnly: !!options.cacheOnly },
            { source: localeSource, target: targetLocale },
            buildData.meta,
            partialLocaleData,
          );
          resultData[localeFileId] = result.data[localeFileId];
  
          spinner.succeed(`[${targetLocale}] File ${j + 1}/${localeEntries.length} processed.`);
        }
  
        await saveFullLocaleData(targetLocale, resultData);
        await saveClientLocaleData(targetLocale, resultData, buildData.meta);
      }
  
      spinner.succeed('Replexica processing complete!');
    } catch (error: any) {
      spinner.fail(`Failed to process i18n: ${error.message}`);
      return process.exit(1);
    }
  });

async function processI18n(
  params: { workflowId: string, cacheOnly: boolean },
  locale: { source: string, target: string },
  meta: any,
  data: any,
) {
  const env = getEnv();
  const apiKey = await loadApiKey();

  const res = await fetch(`${env.REPLEXICA_API_URL}/i18n`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      params,
      locale,
      meta,
      data,
    }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
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
