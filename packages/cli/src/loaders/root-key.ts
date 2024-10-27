import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createRootKeyLoader(replaceAll = false): ILoader<Record<string, any>, Record<string, any>> {
  return createLoader({
    async pull(locale, rawData) {
      const result = rawData[locale];
      return result;
    },
    async push(locale, data, rawData) {
      const result = {
        ...(replaceAll ? {} : rawData),
        [locale]: data,
      };
      return result;
    },
  });
}
