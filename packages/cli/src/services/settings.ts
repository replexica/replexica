import Z from 'zod';
import fs from 'fs';
import Ini from 'ini';
import os from 'os';
import path from 'path';
import { getEnv } from './env.js';

const settingsFile = ".replexicarc";
const homedir = os.homedir();
const settingsFilePath = path.join(homedir, settingsFile);
const env = getEnv();

const SettingsFileSchema = Z.object({
  api: Z.object({
    url: Z.string().default(env.REPLEXICA_API_URL),
  }),
  auth: Z.object({
    apiKey: Z.string().nullable().default(env.REPLEXICA_API_KEY),
  }),
});

export async function loadSettings() {
  const authFileExists = fs.existsSync(settingsFilePath);
  if (!authFileExists) { return createEmptySettings(); }

  const fileContents = fs.readFileSync(settingsFilePath, "utf8");
  const parsed = Ini.parse(fileContents);
  const settings = SettingsFileSchema.parse(parsed);

  const env = await getEnv();
  settings.auth.apiKey = env.REPLEXICA_API_KEY || settings.auth.apiKey;

  return settings;
}

async function createEmptySettings(): Promise<Z.infer<typeof SettingsFileSchema>> {
  return {
    api: {
      url: env.REPLEXICA_API_URL,
    },
    auth: {
      apiKey: null,
    },
  };
}

export async function saveSettings(config: Z.infer<typeof SettingsFileSchema>) {
  const serialized = Ini.stringify(config);
  fs.writeFileSync(settingsFilePath, serialized);
}
