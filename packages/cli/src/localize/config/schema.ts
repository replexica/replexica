import { z } from 'zod';

const supportedLanguages = z.enum(['en', 'es', 'ca', 'fr', 'it', 'de', 'ja', 'ko', 'zh-CN', 'ru']);

const supportedProjectTypes = z.enum(['json', 'xcode', 'yaml', 'yaml-root-key', 'markdown']);

const languageSchema = z.object({
  source: supportedLanguages,
  target: z.array(supportedLanguages).transform((val) => {
    if (val.length === 0) {
      throw new Error('target languages must not be empty');
    }
    const uniqueTargetLangs = [...new Set(val)];
    if (uniqueTargetLangs.length !== val.length) {
      throw new Error('target languages must be unique');
    }
    return uniqueTargetLangs;
  }),
});

const projectSchema = z.object({
  name: z.string(),
  type: supportedProjectTypes.optional().default('json'),
  dictionary: z.string(),
});

export const configSchema = z.object({
  version: z.literal(1),
  languages: languageSchema,
  projects: z.array(projectSchema),
});

export type ConfigSchema = z.infer<typeof configSchema>;
