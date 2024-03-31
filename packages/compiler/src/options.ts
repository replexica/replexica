import Z from 'zod';

const supportedLocale = Z.enum(['en', 'es']);
const optionsSchema = Z.object({
  locale: Z.object({
    source: supportedLocale,
    targets: Z.array(supportedLocale),
  }),
  rsc: Z.boolean().optional().default(true),
  debug: Z.boolean().optional().default(false),
});

export type ReplexicaConfig = Z.infer<typeof optionsSchema>;

export function parseOptions(options: unknown): ReplexicaConfig {
  return optionsSchema.parse(options);
}