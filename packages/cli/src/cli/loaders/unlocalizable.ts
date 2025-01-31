import _ from "lodash";
import _isUrl from "is-url";
import { isValid, parseISO } from "date-fns";

import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createUnlocalizableLoader(): ILoader<Record<string, any>, Record<string, any>> {
  const rules = {
    isEmpty: (v: any) => _.isEmpty(v),
    isNumber: (v: string) => !_.isNaN(_.toNumber(v)),
    isBoolean: (v: string) => _.isBoolean(v),
    isIsoDate: (v: string) => _.isString(v) && _isIsoDate(v),
    isSystemId: (v: string) => _.isString(v) && _isSystemId(v),
    isUrl: (v: string) => _.isString(v) && _isUrl(v),
  };
  return createLoader({
    async pull(locale, input) {
      const passthroughKeys = Object.entries(input)
        .filter(([key, value]) => {
          // Check each rule individually for better debugging
          for (const [ruleName, rule] of Object.entries(rules)) {
            if (rule(value)) {
              return true;
            }
          }
          return false;
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

function _isSystemId(v: string) {
  return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z0-9]{22}$/.test(v);
}

function _isIsoDate(v: string) {
  return isValid(parseISO(v));
}
