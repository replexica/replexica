import { readFileSync, existsSync } from 'fs';
import {parse} from 'yaml';
import { configSchema } from './schema.js';

export function loadConfig(configFilePath: string) {
  const configExists = existsSync(configFilePath);
  if (!configExists) { return null; }

  const configFileContent = readFileSync(configFilePath, 'utf8');
  const configObject = parse(configFileContent);
  const config = configSchema.parse(configObject);

  return config;
}
