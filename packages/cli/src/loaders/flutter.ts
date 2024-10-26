import _ from 'lodash';
import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createFlutterLoader(): ILoader<Record<string, any>, Record<string, any>> {
  return createLoader({
    async pull(locale, rawData) {
      // skip all metadata (keys starting with @)
      const result = _.pickBy(
        rawData,
        (value, key) => !key.startsWith('@'),
      );
      return result;
    },
    async push(locale, data, rawData) {
      const result = _.merge({ '@@locale': locale }, rawData, data);
      return result;
    }
  });
}
