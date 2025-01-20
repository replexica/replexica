import _ from "lodash";

import { ILoader } from "./_types";
import { createLoader } from "./_utils";

const { isDate, isNumber, isBoolean } = _;

export default function createUnlocalizableLoader(): ILoader<Record<string, any>, Record<string, any>> {
  return createLoader({
    async pull(locale, input) {
      const passthroughKeys = Object.entries(input)
        .filter(([_, value]) => {
          return [
            (v: string) => isDate(v),
            (v: string) => isNumber(v),
            (v: string) => isBoolean(v),
            (v: string) => _isCSpecifier(v?.trim()),
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

function _isCSpecifier(value: string) {
  const formatSpecifierPattern =
    /^%(?:\d+\$)?[-+0# ]*(?:\d+|\*)?(?:\.(?:\d+|\*))?(?:hh?|ll?|[jztL])?[@dDuUxXoOfFeEgGcCsSpaA]$/;
  const percentPattern = /^%%$/;

  return formatSpecifierPattern.test(value) || percentPattern.test(value);
}
