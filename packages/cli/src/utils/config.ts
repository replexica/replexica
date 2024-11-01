import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import { I18nConfig, parseI18nConfig } from '@replexica/spec';
import detectIndent from 'detect-indent'

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
    saveConfig(result, fileContents);
  }

  return result;
}

export async function saveConfig(
  config: I18nConfig,
  originalFileContents?: string
) {
  let indent = '  ';
  const configFilePath = _getConfigFilePath();

  if(originalFileContents){
    indent = detectIndent(originalFileContents).indent;
  }
  
  const serialized = JSON.stringify(config, null, indent);

  fs.writeFileSync(configFilePath, serialized);

  return config;
}

// Private

function _getConfigFilePath() {
  return path.join(process.cwd(), "i18n.json");
}
