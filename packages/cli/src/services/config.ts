import Z from 'zod';
import fs from 'fs';
import path from 'path';
import { contentTypeSchema, sourceLocaleSchema, targetLocaleSchema } from '@replexica/spec';

const configFile = "i18n.json";
const configFilePath = path.join(process.cwd(), configFile);

const localeSchema = Z.object({
  source: sourceLocaleSchema,
  targets: Z.array(targetLocaleSchema),
});

const contentItemSchema = Z.object({
  type: contentTypeSchema,
  path: Z.string(),
});

const configFileSchema = Z.object({
  version: Z.literal(1),
  debug: Z.boolean().default(false),
  locale: localeSchema,
  content: Z.array(contentItemSchema).default([]).optional(),
});

export async function loadConfig(): Promise<Z.infer<typeof configFileSchema> | null> {
  const configFileExists = await fs.existsSync(configFilePath);
  if (!configFileExists) { return null; }

  const fileContents = fs.readFileSync(configFilePath, "utf8");
  const rawConfig = JSON.parse(fileContents);
  const config = configFileSchema.parse(rawConfig);

  return config;
}

export async function createEmptyConfig(): Promise<Z.infer<typeof configFileSchema>> {
  return {
    version: 1,
    debug: false,
    locale: {
      source: 'en',
      targets: ['es'],
    },
    content: [],
  };
}

export async function saveConfig(config: Z.infer<typeof configFileSchema>) {
  const serialized = JSON.stringify(config, null, 2);
  fs.writeFileSync(configFilePath, serialized);
}
