import Z from 'zod';
import fs from 'fs';
import Ini from 'ini';
import os from 'os';
import path from 'path';
import dotenv from 'dotenv';
import _ from 'lodash';

const settingsFile = ".replexicarc";
const homedir = os.homedir();
const settingsFilePath = path.join(homedir, settingsFile);

const settingsSchema = Z.object({
  auth: Z.object({
    apiKey: Z.string().optional(),
    apiUrl: Z.string().default('https://engine.replexica.com'),
    webUrl: Z.string().default('https://replexica.com'),
  }),
});

function getEnv() {
  dotenv.config();
  return Z.object({
    REPLEXICA_API_KEY: Z.string().optional(),
    REPLEXICA_API_URL: Z.string().optional(),
    REPLEXICA_WEB_URL: Z.string().optional(),
  })
    .passthrough()
    .parse(process.env);
}

export async function loadSettings() {
  const settingsFileData = await loadSettingsFile();
  const env = getEnv();

  const result = settingsSchema.parse({
    auth: {
      apiKey: env.REPLEXICA_API_KEY || settingsFileData.auth?.apiKey,
      apiUrl: env.REPLEXICA_API_URL || settingsFileData.auth?.apiUrl,
      webUrl: env.REPLEXICA_WEB_URL || settingsFileData.auth?.webUrl,
    },
  });
  return result;
}

export async function saveSettings(settings: Z.infer<typeof settingsSchema>) {
  const settingsFileData = await loadSettingsFile();
  const newSettings = _.merge(settingsFileData, settings);
  const content = Ini.stringify(newSettings);

  fs.writeFileSync(settingsFilePath, content);
}

async function loadSettingsFile() {
  try {
    const content = fs.readFileSync(settingsFilePath, 'utf-8');
    return Ini.parse(content);
  } catch (e) {
    return {};
  }
}
