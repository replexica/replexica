import _ from "lodash";

import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createUnlocalizableLoader(): ILoader<Record<string, any>, Record<string, any>> {
  return createLoader({
    async pull(locale, input) {
      const passthroughKeys = Object.entries(input)
        .filter(([key, value]) => {
          return [
            (v: any) => _.isEmpty(v),
            (v: string) => _.isDate(v),
            (v: string) => _.isNumber(v),
            (v: string) => _.isBoolean(v),
          ].some((fn) => fn(value));
        })
        .map(([key, _]) => key);

      const result = _.omitBy(input, (_, key) => passthroughKeys.includes(key));
      return result;
    },
    async push(locale, data, originalInput) {
      const result = _.merge({}, originalInput, data);
      return result;
    },
  });
}
