import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { stringify } from 'yaml';
import { ConfigSchema } from './schema.js';

export function saveConfig(configFilePath: string, configObject: ConfigSchema) {
  const configYaml = stringify(configObject);
  mkdirSync(dirname(configFilePath), { recursive: true });
  writeFileSync(configFilePath, configYaml);
}
