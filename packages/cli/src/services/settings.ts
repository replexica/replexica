import Z from 'zod';
import fs from 'fs';
import Ini from 'ini';
import os from 'os';
import path from 'path';

const settingsFile = ".replexicarc";
const homedir = os.homedir();
const settingsFilePath = path.join(homedir, settingsFile);

const SettingsFileSchema = Z.object({
  auth: Z.object({
    apiKey: Z.string().nullable(),
  }),
});

export async function loadSettings() {
  const authFileExists = fs.existsSync(settingsFilePath);
  let rawSettings = createEmptySettings(); 

  if (authFileExists) {
    const fileContents = fs.readFileSync(settingsFilePath, "utf8");
    rawSettings = Ini.parse(fileContents) as any;
  }
  const settings = SettingsFileSchema.parse(rawSettings);

  return settings;
}

function createEmptySettings(): Z.infer<typeof SettingsFileSchema> {
  return {
    auth: {
      apiKey: null,
    },
  };
}

export async function saveSettings(config: Z.infer<typeof SettingsFileSchema>) {
  const serialized = Ini.stringify(config);
  fs.writeFileSync(settingsFilePath, serialized);
}
