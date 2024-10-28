import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createRootKeyLoader(replaceAll = false): ILoader<Record<string, any>, Record<string, any>> {
  return createLoader({
    async pull(locale, input) {
      const result = input[locale];
      return result;
    },
    async push(locale, data, originalInput) {
      const result = {
        ...(replaceAll ? {} : originalInput),
        [locale]: data,
      };
      return result;
    },
  });
}
