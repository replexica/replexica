import fs from 'fs/promises';
import path from 'path';
import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createTextFileLoader(pathPattern: string): ILoader<void, string> {
  return createLoader({
    pull: async (locale) => {
      const draftPath = pathPattern.replace('[locale]', locale);
      const finalPath = path.resolve(draftPath);
      
      // Handle non-existent files
      const exists = await fs.access(finalPath).then(() => true).catch(() => false);
      if (!exists) { return ''; }
      
      const result = await fs.readFile(finalPath, 'utf-8');
      return result;
    },
    push: async (locale, data) => {
      const draftPath = pathPattern.replace('[locale]', locale);
      const finalPath = path.resolve(draftPath);
      
      // Create parent directories if needed
      const dirPath = path.dirname(finalPath);
      await fs.mkdir(dirPath, { recursive: true });
      
      // Ensure consistent line endings
      const finalPayload = data.trim() + '\n';
      await fs.writeFile(finalPath, finalPayload, { encoding: 'utf-8', flag: 'w' });
    },
  });
}
