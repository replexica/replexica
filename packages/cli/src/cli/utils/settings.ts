import os from "os";
import path from "path";
import _ from "lodash";
import Z from "zod";
import fs from "fs";
import Ini from "ini";

export type CliSettings = Z.infer<typeof SettingsSchema>;

export function getSettings(explicitApiKey: string | undefined): CliSettings {
  const env = _loadEnv();
  const systemFile = _loadSystemFile();
  const defaults = _loadDefaults();

  _legacyEnvVarWarning();

  return {
    auth: {
      apiKey: explicitApiKey || env.LINGODOTDEV_API_KEY || systemFile.auth?.apiKey || defaults.auth.apiKey,
      apiUrl: env.LINGODOTDEV_API_URL || systemFile.auth?.apiUrl || defaults.auth.apiUrl,
      webUrl: env.LINGODOTDEV_WEB_URL || systemFile.auth?.webUrl || defaults.auth.webUrl,
    },
  };
}

export function saveSettings(settings: CliSettings): void {
  _saveSystemFile(settings);
}

const SettingsSchema = Z.object({
  auth: Z.object({
    apiKey: Z.string(),
    apiUrl: Z.string(),
    webUrl: Z.string(),
  }),
});

// Private

function _loadDefaults(): CliSettings {
  return {
    auth: {
      apiKey: "",
      apiUrl: "https://engine.lingo.dev",
      webUrl: "https://lingo.dev",
    },
  };
}

function _loadEnv() {
  return Z.object({
    LINGODOTDEV_API_KEY: Z.string().optional(),
    LINGODOTDEV_API_URL: Z.string().optional(),
    LINGODOTDEV_WEB_URL: Z.string().optional(),
  })
    .passthrough()
    .parse(process.env);
}

function _loadSystemFile() {
  const settingsFilePath = _getSettingsFilePath();
  const content = fs.existsSync(settingsFilePath) ? fs.readFileSync(settingsFilePath, "utf-8") : "";
  const data = Ini.parse(content);

  return Z.object({
    auth: Z.object({
      apiKey: Z.string().optional(),
      apiUrl: Z.string().optional(),
      webUrl: Z.string().optional(),
    }).optional(),
  })
    .passthrough()
    .parse(data);
}

function _saveSystemFile(settings: CliSettings) {
  const settingsFilePath = _getSettingsFilePath();
  const content = Ini.stringify(settings);
  fs.writeFileSync(settingsFilePath, content);
}

function _getSettingsFilePath(): string {
  const settingsFile = ".lingodotdevrc";
  const homedir = os.homedir();
  const settingsFilePath = path.join(homedir, settingsFile);
  return settingsFilePath;
}

function _legacyEnvVarWarning() {
  const env = _loadEnv();

  if (env.REPLEXICA_API_KEY && !env.LINGODOTDEV_API_KEY) {
    console.warn(
      "\x1b[33m%s\x1b[0m",
      `
⚠️  WARNING: REPLEXICA_API_KEY env var is deprecated ⚠️
===========================================================

Please use LINGODOTDEV_API_KEY instead.
===========================================================
`,
    );
  }
}
