import _ from "lodash";

import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createSyncLoader(): ILoader<Record<string, string>, Record<string, string>> {
  return createLoader({
    async pull(locale, input, originalInput) {
      if (!originalInput) {
        return input;
      }

      return _.chain(originalInput)
        .mapValues((value, key) => input[key])
        .value() as Record<string, string>;
    },
    async push(locale, data, originalInput) {
      if (!originalInput) {
        return data;
      }

      return _.chain(originalInput || {})
        .mapValues((value, key) => data[key])
        .value();
    },
  });
}
