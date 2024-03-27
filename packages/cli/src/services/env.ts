import Z from 'zod';

const EnvSchema = Z.object({
  REPLEXICA_API_KEY: Z.string(),
  REPLEXICA_API_URL: Z.string().optional().default('https://engine.replexica.com'),
});

export function getEnv() {
  try {
    return EnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof Z.ZodError) {
      // handle missing api key
      if (
        error.errors.some((err) => err.path.find((p) => p === 'REPLEXICA_API_KEY') &&
          err.message.toLowerCase().includes('required'))
      ) {
        console.log(`REPLEXICA_API_KEY is missing in env variables. Did you forget to run 'replexica auth'?`);
        return process.exit(1);
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }
}
