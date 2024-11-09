import xliff from "xliff";
import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createXliffLoader(): ILoader<
  string,
  Record<string, string>
> {
  return createLoader({
    async pull(locale, input) {
      const result: Record<string, string> = {};
      try {
        const res = await xliff.xliff2js(input);
        return res;
      } catch (err) {
        return result;
      }
    },
    async push(locale, data) {
      const result = await xliff.js2xliff(data);
      return result;
    },
  });
}
