import { flatten, unflatten } from "flat";
import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createFlatLoader(): ILoader<Record<string, any>, Record<string, string>> {
  return createLoader({
    pull: async (locale, input) => {
      return flatten(input || {}, {
        delimiter: '/',
        transformKey(key) {
          return encodeURIComponent(String(key));
        },
      });
    },
    push: async (locale, data, originalStructure) => {
      const unflattened = unflattenWithStructure(data, originalStructure);
      return unflattened;
    },
  });

  function unflattenWithStructure(flatData: { [s: string]: unknown; } | ArrayLike<unknown>, originalStructure: any, delimiter = '/') {
    const result: { [key: string]: any } = {};
    
    for (const [flatKey, value] of Object.entries(flatData)) {
      const keys = flatKey.split(delimiter);
      let current = result;
      let originalCurrent = originalStructure;
      
      for (let i = 0; i < keys.length; i++) {
        const key = decodeURIComponent(String(keys[i]));
        
        if (i === keys.length - 1) {
          // Last key, set the value
          current[key] = value;
        } else {
          // Check original structure to determine if we should create an array or object
          const isArray = Array.isArray(originalCurrent[key]);
          current[key] = current[key] || (isArray ? [] : {});
          current = current[key];
          originalCurrent = originalCurrent[key];
        }
      }
    }
    
    return result;
  }
}
