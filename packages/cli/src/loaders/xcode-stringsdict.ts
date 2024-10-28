import plist from 'plist';
import { ILoader } from "./_types";
import { createLoader } from "./_utils";
import { ReplexicaCLIError } from '../utils/errors';

const emptyData = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
  '<plist version="1.0">',
  '<dict/>',
  '</plist>'
].join('\n');

export default function createXcodeStringsdictLoader(): ILoader<string, Record<string, any>> {
  return createLoader({
    async pull(locale, input) {
      try {
        const parsed = plist.parse(input || emptyData);
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
