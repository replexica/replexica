import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createJsonLoader(): ILoader<string, Record<string, any>> {
  return createLoader({
    pull: async (rawData, locale) => {
      const data = JSON.parse(rawData);
      return data;
    },
    push: async (data, locale) => {
      const serializedData = JSON.stringify(data);
      return serializedData;
    },
  });
}
