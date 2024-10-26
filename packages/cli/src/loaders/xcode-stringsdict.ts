import plist from 'plist';
import { ILoader } from "./_types";
import { createLoader } from "./_utils";
import { ReplexicaCLIError } from '../utils/errors';

export default function createXcodeStringsdictLoader(): ILoader<string, Record<string, any>> {
  return createLoader({
    async pull(locale, rawData) {
      try {
        const parsed = plist.parse(rawData);
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
    async push(locale, payload) {
      const plistContent = plist.build(payload);
      return plistContent;
    }
  });
}
