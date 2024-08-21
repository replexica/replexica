import { localeCodeSchema } from "@replexica/spec";
import Z from 'zod';
import path from 'path';
import fs from 'fs';

export interface IBucketLoader {
  load: (locale: Z.infer<typeof localeCodeSchema>, localeFilePath: string) => Promise<any>;
  save: (locale: Z.infer<typeof localeCodeSchema>, localeFilePath: string, content: any) => Promise<void>;
}

export function createFileLoader(): IBucketLoader {
  return {
    async load(locale: Z.infer<typeof localeCodeSchema>, localeFilePath: string) {
      return fs.existsSync(localeFilePath) ? fs.readFileSync(localeFilePath, "utf8") : null;
    },
    async save(locale: Z.infer<typeof localeCodeSchema>, localeFilePath: string, content: any) {
      fs.mkdirSync(path.dirname(localeFilePath), { recursive: true });
      fs.writeFileSync(localeFilePath, content, "utf8");
    }
  };
}
