import plist from 'plist';
import { BucketLoader } from './_base';
import { ReplexicaCLIError } from '../../utils/errors';

export const xcodeStringsdictLoader = (): BucketLoader<string, Record<string, any>> => ({
  async load(text: string) {
    try {
      const parsed = plist.parse(text);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new ReplexicaCLIError({
          message: 'Invalid .stringsdict format',
          docUrl: "invalidStringDict"
        });
      }
      return parsed as Record<string, any>;
    } catch (error: any) {
      throw new ReplexicaCLIError({
        message: `Invalid .stringsdict format: ${error.message}`,
        docUrl: "invalidStringDict"
      });
    }
  },

  async save(payload: Record<string, any>) {
    const plistContent = plist.build(payload);
    return plistContent;
  }
});
