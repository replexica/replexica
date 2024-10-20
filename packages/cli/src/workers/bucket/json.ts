import { jsonrepair } from 'jsonrepair'

import { BucketLoader } from './_base';

export const jsonLoader = (): BucketLoader<string, Record<string, any>> => ({
  async load(text: string) {
    const jsonString = text || '{}';
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      return JSON.parse(jsonrepair(jsonString));
    }
  },
  async save(payload) {
    return JSON.stringify(payload, null, 2);
  }
});
