import fs from 'fs/promises';
import { createLoader } from './_base';

export const textFileLoader = createLoader<string, string>({
  async load(input: string, locale: string) {
    return await fs.readFile(input, 'utf-8');
  },
  async save(payload, locale, input, originalPayload) {
    await fs.writeFile(input, payload, 'utf-8');
    return input;
  },
});