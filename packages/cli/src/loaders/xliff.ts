import xliff from "xliff";
import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createXliffLoader(): ILoader<
  string,
  Record<string, any>
> {
  return createLoader({
    async pull(locale, input) {
      const js = await xliff.xliff2js(input);
      return js || {};
    },
    async push(locale, payload) {
      const res = await xliff.js2xliff(payload);
      return res.trim();
    },
  });
}
