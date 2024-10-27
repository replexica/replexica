import _ from 'lodash';
import isDate from 'lodash/isDate';
import isNumber from 'lodash/isNumber';
import isBoolean from 'lodash/isBoolean';

import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createUnlocalizableLoader(): ILoader<Record<string, any>, Record<string, any>> {
  return createLoader({
    async pull(locale, rawData) {
      const passthroughKeys = Object.entries(rawData)
          .filter(([_, value]) => {
            const stringValue = String(value);
            return [
              (v: string) => isDate(v),
              (v: string) => isNumber(v),
              (v: string) => isBoolean(v),
            ].some(fn => fn(stringValue));
          })
          .map(([key, _]) => key);
      
        const result = _.omitBy(rawData, (_, key) => passthroughKeys.includes(key));
        return result;
    },
    async push(locale, data, rawData) {
      const result = _.merge({}, rawData, data);
      return result;
    }
  });
}
