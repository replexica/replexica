import fs from 'fs/promises';
import { BucketLoader } from './_base';

export const textLoader = (filePath: string): BucketLoader<void, string> => ({
  async load() {
    return await fs.readFile(filePath, 'utf-8');
  },
  async save(payload: string) {
    await fs.writeFile(filePath, payload, { encoding: 'utf-8', flag: 'w' });
  },
})