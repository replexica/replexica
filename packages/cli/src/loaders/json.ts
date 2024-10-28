import { jsonrepair } from 'jsonrepair';
import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createJsonLoader(): ILoader<string, Record<string, any>> {
  return createLoader({
    pull: async (locale, input) => {
      const jsonString = input || '{}';
      let result: Record<string, any>;
      try {
        result = JSON.parse(jsonString);
      } catch (error) {
        result = JSON.parse(jsonrepair(jsonString));
      }
      return result;
    },
    push: async (locale, data) => {
      const serializedData = JSON.stringify(data, null, 2);
      return serializedData;
    },
  });
}
