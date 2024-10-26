import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createRootKeyLoader(): ILoader<Record<string, any>, Record<string, any>> {
  return createLoader({
    async pull(rawData, locale) {
      const result = rawData[locale];
      return result;
    },
    async push(data, locale, rawData) {
      const result = {
        ...rawData,
        [locale]: data,
      };
      return result;
    },
  });
}
