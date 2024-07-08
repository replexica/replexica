import Z from 'zod';
import fs from 'fs';
import path from 'path';
import { configFileSchema } from '@replexica/spec';

export async function loadConfig(): Promise<Z.infer<typeof configFileSchema> | null> {
  const configFilePath = _getConfigFilePath();

  const configFileExists = await fs.existsSync(configFilePath);
  if (!configFileExists) { return null; }

  const fileContents = fs.readFileSync(configFilePath, "utf8");
  const rawConfig = JSON.parse(fileContents);
  const config = configFileSchema.parse(rawConfig);

  return config;
}

export async function saveConfig(config: Z.infer<typeof configFileSchema>) {
  const configFilePath = _getConfigFilePath();

  const serialized = JSON.stringify(config, null, 2);
  fs.writeFileSync(configFilePath, serialized);

  return config;
}

// Private

function _getConfigFilePath() {
  return path.join(process.cwd(), "i18n.json");
}
