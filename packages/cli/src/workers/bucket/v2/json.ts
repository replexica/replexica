import { jsonrepair } from 'jsonrepair'

import { BucketLoader } from './_base';

export const jsonLoader = (): BucketLoader<string, Record<string, any>> => ({
  async load(text: string) {
    const repaired = jsonrepair(text || '{}');
    return JSON.parse(repaired);
  },
  async save(payload) {
    return JSON.stringify(payload, null, 2);
  }
});
