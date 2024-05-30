import Z from 'zod';
import { sourceLocaleSchema, targetLocaleSchema } from './locales';
import { bucketTypeSchema } from './formats';

export const localeSchema = Z.object({
  source: sourceLocaleSchema,
  targets: Z.array(targetLocaleSchema),
});

export const configFileSchema = Z.object({
  locale: localeSchema,
  buckets: Z.record(
    Z.string(),
    bucketTypeSchema,
  ).default({}).optional(),
});

export const defaultConfig: Z.infer<typeof configFileSchema> = {
  locale: {
    source: 'en',
    targets: ['es'],
  },
  buckets: {},
};
