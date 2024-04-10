import Z from 'zod';
import dotenv from 'dotenv';

const EnvSchema = Z.object({
  REPLEXICA_API_KEY: Z.string().optional(),
  REPLEXICA_API_URL: Z.string().default('https://engine.replexica.com'),
  REPLEXICA_WEB_URL: Z.string().default('https://replexica.com'),
});

export function getEnv() {
  dotenv.config();
  return EnvSchema.parse(process.env);
}
