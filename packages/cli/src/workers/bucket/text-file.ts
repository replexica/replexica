import fs from 'fs/promises';
import path from 'path'; // Import the path module
import { BucketLoader } from './_base';

export const textLoader = (filePath: string): BucketLoader<void, string> => {
  const resolvedPath = path.resolve(filePath); // Resolve the file path

  return {
    async load() {
      const exists = await fs.access(resolvedPath).then(() => true).catch(() => false);
      if (!exists) { return ''; }

      return await fs.readFile(resolvedPath, 'utf-8');
    },
    async save(payload: string) {    
      // create parent directories if they don't exist
      await fs.mkdir(resolvedPath.split('/').slice(0, -1).join('/'), { recursive: true });
      // write the file
      const finalPayload = payload.trim() + '\n';
      await fs.writeFile(resolvedPath, finalPayload, { encoding: 'utf-8', flag: 'w' });
    },
  };
}
