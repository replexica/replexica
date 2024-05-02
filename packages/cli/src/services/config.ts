import Z from 'zod';
import fs from 'fs';
import path from 'path';
import { configFileSchema } from '@replexica/spec';

const configFile = "i18n.json";
const configFilePath = path.join(process.cwd(), configFile);

export async function loadConfig(): Promise<Z.infer<typeof configFileSchema> | null> {
  const configFileExists = await fs.existsSync(configFilePath);
  if (!configFileExists) { return null; }

  const fileContents = fs.readFileSync(configFilePath, "utf8");
  const rawConfig = JSON.parse(fileContents);
  const config = configFileSchema.parse(rawConfig);

  return config;
}

export async function saveConfig(config: Z.infer<typeof configFileSchema>) {
  const serialized = JSON.stringify(config, null, 2);
  fs.writeFileSync(configFilePath, serialized);
  return config;
}
