import { flatten, unflatten } from "flat";
import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createFlatLoader(): ILoader<Record<string, any>, Record<string, string>> {
  return createLoader({
    pull: async (rawData, locale) => {
      const flattenedData = flatten(rawData || {}) as Record<string, string>;
      return flattenedData;
    },
    push: async (data, locale) => {
      const unflattenedData = unflatten(data || {}) as Record<string, any>;
      return unflattenedData;
    },
  });
}
