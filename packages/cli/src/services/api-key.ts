import { getEnv } from "./env.js";
import { loadSettings, saveSettings } from "./settings.js";

export async function saveApiKey(apiKey: string | null) {
  const settings = await loadSettings();
  settings.auth.apiKey = apiKey;
  await saveSettings(settings);
}

export async function loadApiKey() {
  const env = getEnv();
  const settings = await loadSettings();
  return env.REPLEXICA_API_KEY || settings.auth.apiKey;
}