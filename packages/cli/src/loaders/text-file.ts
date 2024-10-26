import fs from 'fs/promises';
import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createTextFileLoader(pathPattern: string): ILoader<void, string> {
  return createLoader({
    pull: async (rawData, locale) => {
      const finalPath = pathPattern.replace('[locale]', locale);
      const data = await fs.readFile(finalPath, 'utf-8');
      return data;
    },
    push: async (data, locale) => {
      const finalPath = pathPattern.replace('[locale]', locale);
      await fs.writeFile(finalPath, data);
    },
  });
}
