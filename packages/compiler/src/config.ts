import Z from 'zod';
import path from 'path';
import fs from 'fs';
import { parseI18nConfig, I18nConfig } from '@replexica/spec';

const compilerConfigSchema = Z.object({
  sourceRoot: Z.string().optional().default('src'),
  rsc: Z.boolean().optional().default(false),
  debug: Z.boolean().optional().default(false),
});

export type CompilerConfig = Z.infer<typeof compilerConfigSchema>;

export function parseCompilerConfig(config: any): CompilerConfig {
  return compilerConfigSchema.parse(config);
}

export function loadI18nConfig(): I18nConfig {
  const configFileName = 'i18n.json';
  const configFilePath = path.resolve(process.cwd(), configFileName);
  const configFileExists = fs.existsSync(configFilePath);
  if (!configFileExists) {
    throw new Error(`Could not find ${configFileName} in the current working directory. Did you forget to run \`replexica init\`?`);
  };
  const configFile = fs.readFileSync(configFilePath, 'utf-8');
  const configFileObj = JSON.parse(configFile);

  const result = parseI18nConfig(configFileObj);
  return result;
}
