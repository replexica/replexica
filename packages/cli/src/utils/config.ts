import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import { I18nConfig, parseI18nConfig } from '@replexica/spec';
import prettier from 'prettier';

export function getConfig(resave = true): I18nConfig | null {
  const configFilePath = _getConfigFilePath();

  const configFileExists = fs.existsSync(configFilePath);
  if (!configFileExists) { return null; }

  const fileContents = fs.readFileSync(configFilePath, "utf8");
  const rawConfig = JSON.parse(fileContents);

  const result = parseI18nConfig(rawConfig);
  const didConfigChange = !_.isEqual(rawConfig, result);

  if (resave && didConfigChange) {
    // Ensure the config is saved with the latest version / schema
    saveConfig(result);
  }

  return result;
}

export async function saveConfig(config: I18nConfig) {
  const configFilePath = _getConfigFilePath();

  const prettierConfigFilePath = await prettier.resolveConfigFile() || ''

  const prettierOptions = await prettier.resolveConfig(prettierConfigFilePath, {editorconfig: true}) || {
    parser: 'json',
    useTabs: false,
    tabWidth: 2,
  }
    
  const serialized = await prettier.format(JSON.stringify(config), prettierOptions);
  
  fs.writeFileSync(configFilePath, serialized);

  return config;
}

// Private

function _getConfigFilePath() {
  return path.join(process.cwd(), "i18n.json");
}
