import plist from 'plist';
import { BucketLoader } from './_base';

export const xcodeStringsdictLoader = (): BucketLoader<string, Record<string, any>> => ({
  async load(text: string) {
    try {
      const parsed = plist.parse(text);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid .stringsdict format');
      }
      return parsed as Record<string, any>;
    } catch (error: any) {
      throw new Error(`Invalid .stringsdict format: ${error.message}`);
    }
  },

  async save(payload: Record<string, any>) {
    const plistContent = plist.build(payload);
    return plistContent;
  }
});
