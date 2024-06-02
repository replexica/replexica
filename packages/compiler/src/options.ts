import Z from 'zod';
import { sourceLocaleSchema, targetLocaleSchema } from '@replexica/spec';

const optionsSchema = Z.object({
  locale: Z.object({
    source: sourceLocaleSchema,
    targets: Z.array(targetLocaleSchema),
  }),
  rsc: Z.boolean().optional().default(true),
  debug: Z.boolean().optional().default(false),
});

export type ReplexicaConfig = Z.infer<typeof optionsSchema>;

export function parseOptions(options: unknown): ReplexicaConfig {
  return optionsSchema.parse(options);
}