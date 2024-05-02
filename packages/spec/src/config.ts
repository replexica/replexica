import Z from 'zod';
import { sourceLocaleSchema, targetLocaleSchema } from './locales';
import { bucketTypeSchema } from './formats';

const localeSchema = Z.object({
  source: sourceLocaleSchema,
  targets: Z.array(targetLocaleSchema),
});

export const configFileSchema = Z.object({
  version: Z.literal(1),
  debug: Z.boolean().default(false).optional(),
  locale: localeSchema,
  buckets: Z.record(Z.string(), bucketTypeSchema).default({}).optional(),
});

export const defaultConfig: Z.infer<typeof configFileSchema> = {
  version: 1,
  locale: {
    source: 'en',
    targets: ['es'],
  },
  buckets: {},
};
