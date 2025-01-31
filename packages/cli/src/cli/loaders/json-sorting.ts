import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createJsonSortingLoader(): ILoader<Record<string, any>, Record<string, any>> {
  return createLoader({
    async pull(locale, input) {
      return input;
    },
    async push(locale, data, originalInput) {
      return sortObjectDeep(data);
    },
  });
}

function sortObjectDeep(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectDeep);
  }

  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .reduce((result: any, key) => {
        result[key] = sortObjectDeep(obj[key]);
        return result;
      }, {});
  }

  return obj;
}
