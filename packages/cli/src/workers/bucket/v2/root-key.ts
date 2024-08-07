import { BucketLoader } from './_base';

export const rootKeyLoader = (
  locale: string,
  loader: BucketLoader<void, Record<string, any>>,
): BucketLoader<void, Record<string, any>> => ({
  async load() {
    const input = await loader.load();
    const result = input[locale];
    return result;
  },
  async save(payload) {
    const input = await loader.load();
    const result = {
      ...input,
      [locale]: payload
    };
    await loader.save(result);
  },
});