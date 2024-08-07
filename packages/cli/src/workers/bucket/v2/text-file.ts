import fs from 'fs/promises';
import { BucketLoader } from './_base';

export const textLoader = (filePath: string): BucketLoader<void, string> => ({
  async load() {
    const exists = await fs.access(filePath).then(() => true).catch(() => false);
    if (!exists) { return ''; }

    return await fs.readFile(filePath, 'utf-8');
  },
  async save(payload: string) {    
    // create parent directories if they don't exist
    await fs.mkdir(filePath.split('/').slice(0, -1).join('/'), { recursive: true });
    // write the file
    const finalPayload = payload.trim() + '\n';
    await fs.writeFile(filePath, finalPayload, { encoding: 'utf-8', flag: 'w' });
  },
})