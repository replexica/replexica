import _ from "lodash";
import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createFlutterLoader(): ILoader<Record<string, any>, Record<string, any>> {
  return createLoader({
    async pull(locale, input) {
      // skip all metadata (keys starting with @)
      const result = _.pickBy(input, (value, key) => !key.startsWith("@"));
      return result;
    },
    async push(locale, data, originalInput) {
      const result = _.merge({}, originalInput, { "@@locale": locale }, data);
      return result;
    },
  });
}
