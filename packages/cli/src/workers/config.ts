import Z from 'zod';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import { I18nConfig, parseI18nConfig } from '@replexica/spec';

export async function loadConfig(resave = true): Promise<I18nConfig | null> {
  const configFilePath = _getConfigFilePath();

  const configFileExists = await fs.existsSync(configFilePath);
  if (!configFileExists) { return null; }

  const fileContents = fs.readFileSync(configFilePath, "utf8");
  const rawConfig = JSON.parse(fileContents);

  const result = parseI18nConfig(rawConfig);
  const didConfigChange = !_.isEqual(rawConfig, result);

  if (resave && didConfigChange) {
    // Ensure the config is saved with the latest version / schema
    await saveConfig(result);
  }

  return result;
}

export async function saveConfig(config: I18nConfig) {
  const configFilePath = _getConfigFilePath();

  const serialized = JSON.stringify(config, null, 2);
  fs.writeFileSync(configFilePath, serialized);

  return config;
}

// Private

function _getConfigFilePath() {
  return path.join(process.cwd(), "i18n.json");
}
