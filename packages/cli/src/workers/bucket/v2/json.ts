import { createLoader } from "./_base";

export const jsonLoader = createLoader<string, Record<string, any>>({
  async load(text: string) {
    return JSON.parse(text);
  },
  async save(payload) {
    return JSON.stringify(payload, null, 2);
  }
});