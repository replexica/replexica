import Z from 'zod';
import { sourceLocaleSchema, targetLocaleSchema, contentTypeSchema } from '@replexica/spec';

const languageSchema = Z.object({
  source: sourceLocaleSchema,
  target: Z.array(targetLocaleSchema),
});

const contentItemSchema = Z.object({
  name: Z.string(),
  type: contentTypeSchema.optional().default('json'),
  path: Z.string(),
});

export const configSchema = Z.object({
  version: Z.literal(1),
  languages: languageSchema,
  projects: Z.array(contentItemSchema).default([]).optional(),
});

export type ConfigSchema = Z.infer<typeof configSchema>;
