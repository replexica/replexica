import { flatten, unflatten } from 'flat';
import { BucketLoader } from './_base';

export const flatLoader = (): BucketLoader<Record<string, any>, Record<string, string>> => ({
  async load(payload) {
    return flatten(payload, {
      delimiter: '/',
      transformKey(key) {
        return encodeURIComponent(String(key));
      },
    });
  },
  async save(payload) {
    return unflatten(payload, {
      delimiter: '/',
      transformKey(key) {
        return decodeURIComponent(String(key));
      },
    });
  },
});
