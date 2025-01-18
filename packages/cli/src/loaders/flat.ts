import { flatten, unflatten } from "flat";
import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createFlatLoader(): ILoader<
  Record<string, any>,
  Record<string, string>
> {
  return createLoader({
    pull: async (locale, input) => {
      return flatten(input || {}, {
        delimiter: "/",
        transformKey(key) {
          return encodeURIComponent(String(key));
        },
      });
    },
    push: async (locale, data) => {
      return unflatten(data || {}, {
        delimiter: "/",
        transformKey(key) {
          return decodeURIComponent(String(key));
        },
      });
    },
  });
}
