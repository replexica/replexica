import Z from 'zod';
import { sourceLocaleSchema, targetLocaleSchema, projectTypeSchema } from '@replexica/spec';

const languageSchema = Z.object({
  source: sourceLocaleSchema,
  target: Z.array(targetLocaleSchema),
});

const projectSchema = Z.object({
  name: Z.string(),
  type: projectTypeSchema.optional().default('json'),
  dictionary: Z.string(),
});

export const configSchema = Z.object({
  version: Z.literal(1),
  languages: languageSchema,
  projects: Z.array(projectSchema),
});

export type ConfigSchema = Z.infer<typeof configSchema>;
