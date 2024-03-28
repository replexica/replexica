import path from 'path';
import fs from 'fs/promises';
import { loadConfig } from './config/load.js';
import { ConfigSchema } from './config/schema.js';
import _ from 'lodash';
import { getReplexicaClient } from './engine/client.js';
import { createId } from '@paralleldrive/cuid2';
import YAML from 'yaml';
import Crypto from 'crypto';
import { YamlRorLangDataProcessor } from './lib/lang-data-processor/yaml-ror.js';
import { MarkdownLangDataProcessor } from './lib/lang-data-processor/markdown.js';
import { JsonLangDataProcessor } from './lib/lang-data-processor/json.js';
import { YamlLangDataProcessor } from './lib/lang-data-processor/yaml.js';
import { XcodeLangDataProcessor } from './lib/lang-data-processor/xcode.js';
import { ILangDataProcessor, LangDataType } from './lib/lang-data-processor/base.js';
import { Command } from 'commander';

const TRANSLATIONS_PER_BATCH = 25;

const langDataProcessorsMap = new Map<LangDataType, ILangDataProcessor>()
  .set('markdown', new MarkdownLangDataProcessor())
  .set('json', new JsonLangDataProcessor())
  .set('yaml', new YamlLangDataProcessor())
  .set('yaml-root-key', new YamlRorLangDataProcessor())
  .set('xcode', new XcodeLangDataProcessor());

export default new Command()
  .command('localize')
  .description('Localize i18n JSON with Replexica')
  .helpOption('-h, --help', 'Show help')
  .argument('[root]', 'Root directory of the repository, containing the .replexica/config.yml config file.', '.')
  .option('--trigger-type <triggerType>', 'Environment from which the localization is triggered', 'cli')
  .option('--trigger-name <triggerName>', 'Name of the trigger', '')
  .action(async (root, options) => {
    const config = await extractConfig(root, options.triggerType, options.triggerName);
    for (const project of config.projects) {
      const sourceLangData = await loadProjectLangData(project, config.sourceLang);
      const changedKeys = await calculateChangedKeys(project.name, sourceLangData);

      // Write hash file at the beginning of the process
      // So that if it fails in the middle, we won't have
      // to re-translate everything from scratch again
      await writeHashFile(project.name, sourceLangData);

      for (const targetLang of config.targetLangs) {
        const targetLangData = await loadProjectLangData(project, targetLang);

        const removedKeys = _.difference(Object.keys(targetLangData), Object.keys(sourceLangData));
        const missingKeys = _.difference(Object.keys(sourceLangData), Object.keys(targetLangData));

        const projectLogPrefix = `[${project.name}]`;
        console.info(`${projectLogPrefix} Removed: ${removedKeys.length}. Changed: ${changedKeys.length}. Missing: ${missingKeys.length}.`);

        const keysToTranslate = _.uniq([...changedKeys, ...missingKeys]);

        const translationLogPrefix = `${projectLogPrefix} (${config.sourceLang} -> ${targetLang})`;
        console.log(`${translationLogPrefix} Translating ${keysToTranslate.length} keys`);

        let langDataUpdate: Record<string, string> = {};
        if (keysToTranslate.length) {
          const keysToTranslateChunks = _.chunk(keysToTranslate, TRANSLATIONS_PER_BATCH);

          let translatedKeysCount = 0;
          const groupId = `leg_${createId()}`;
          for (const keysToTranslateChunk of keysToTranslateChunks) {
            console.log(`${translationLogPrefix} Translating keys, ${translatedKeysCount}/${keysToTranslate.length}`);
            const partialDiffRecord = _.pick(sourceLangData, keysToTranslateChunk);
            const partialLangDataUpdate = await translateRecord(
              config.sourceLang,
              targetLang,
              partialDiffRecord,
              groupId,
            );
            langDataUpdate = _.merge(langDataUpdate, partialLangDataUpdate);

            translatedKeysCount += keysToTranslateChunk.length;
          }

          console.log(`Done`);
        } else {
          console.log(`Skipped`);
        }

        const newTargetLangData = _.chain(targetLangData)
          .merge(langDataUpdate)
          .omit(removedKeys)
          .value();

        await saveProjectLangData(project, targetLang, newTargetLangData);
      }
    }
  });
async function writeHashFile(projectName: string, sourceLangData: Record<string, string>) {
  const projectHashfileNode: Record<string, string> = {};
  for (const [key, value] of Object.entries(sourceLangData)) {
    const valueHash = Crypto
      .createHash('sha256')
      .update(value)
      .digest('hex');

    projectHashfileNode[key] = valueHash;
  }
  const replexicaHashfileContent = await fs.readFile('.replexica/hash.yaml', 'utf-8')
    .catch(() => '')
    .then((content) => content.trim() || '');
  const replexicaHashfile = YAML.parse(replexicaHashfileContent) || {} as Record<string, string>;
  replexicaHashfile.version = replexicaHashfile.version || 1;
  replexicaHashfile[projectName] = projectHashfileNode;

  const newReplexicaHashfileContent = [
    '# DO NOT MODIFY THIS FILE MANUALLY',
    '# This file is auto-generated by Replexica. Please keep it in your version control system.',
    YAML.stringify(replexicaHashfile),
  ].join('\n');
  await fs.writeFile('.replexica/hash.yaml', newReplexicaHashfileContent);
}

async function calculateChangedKeys(projectName: string, sourceLangData: Record<string, string>): Promise<string[]> {
  const replexicaHashfileContent = await fs.readFile('.replexica/hash.yaml', 'utf-8')
    .catch(() => '')
    .then((content) => content.trim() || '');
  const replexicaHashfile = YAML.parse(replexicaHashfileContent) || {} as Record<string, string>;
  const projectHashfileNode = replexicaHashfile[projectName] || {};

  const result: string[] = [];
  for (const [key, value] of Object.entries(sourceLangData)) {
    const valueHash = Crypto
      .createHash('sha256')
      .update(value)
      .digest('hex');

    if (projectHashfileNode[key] !== valueHash) {
      result.push(key);
    }
  }

  return result;
}

async function loadProjectLangData(project: ConfigSchema['projects'][0], lang: string): Promise<Record<string, string>> {
  const processor = langDataProcessorsMap.get(project.type);
  if (!processor) { throw new Error('Unsupported project type ' + project.type); }

  const result = await processor.loadLangJson(project.dictionary, lang);

  return result;
}

async function saveProjectLangData(project: ConfigSchema['projects'][0], lang: string, data: Record<string, any>) {
  const processor = langDataProcessorsMap.get(project.type);
  if (!processor) { throw new Error('Unsupported project type ' + project.type); }

  await processor.saveLangJson(project.dictionary, lang, data);
}

async function extractConfig(root: string, triggerType: string, triggerName: string) {
  const configRoot = path.resolve(process.cwd(), root);
  const configFilePath = path.join(configRoot, '.replexica/config.yml');

  const configFileExists = await fs.stat(configFilePath).then(() => true).catch(() => false);
  if (!configFileExists) {
    throw new Error(`Config file not found at ${configFilePath}.`);
  }

  const config: ConfigSchema | null = configFileExists ? loadConfig(configFilePath) : null;

  const sourceLang = config?.languages.source;
  if (!sourceLang) {
    throw new Error('Source language must be specified.');
  }

  const targetLangs = (config?.languages.target || []).filter(Boolean);
  if (targetLangs.length === 0) {
    throw new Error('At least one target language must be specified.');
  }

  const projects = config?.projects || [];
  if (projects.length === 0) {
    throw new Error('At least one project must be specified.');
  }

  return {
    sourceLang,
    targetLangs,
    projects,
    triggerType,
    triggerName,
  };
}

async function translateRecord(
  sourceLang: string,
  targetLang: string, 
  data: Record<string, any>,
  groupId: string,
): Promise<Record<string, string>> {
  if (Object.keys(data).length === 0) { return {}; }

  const replexica = getReplexicaClient();
  const translateRecordResponse = await replexica.localizeJson({
    groupId,
    triggerType: 'cli',
    triggerName: 'cli',

    sourceLocale: sourceLang,
    targetLocale: targetLang,
    data,
  });

  return translateRecordResponse.data;
}
