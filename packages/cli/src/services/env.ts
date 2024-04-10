import Z from 'zod';

const EnvSchema = Z.object({
  REPLEXICA_API_KEY: Z.string().nullable(),
  REPLEXICA_API_URL: Z.string().default(() => 'https://engine.replexica.com'),
});

export function getEnv() {
  return EnvSchema.parse(process.env);
}
