import { formatPlutilStyle } from "../utils/plutil-formatter";
import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createPlutilJsonTextLoader(): ILoader<string, string> {
  return createLoader({
    async pull(locale, data) {
      return data;
    },
    async push(locale, data, originalInput) {
      const jsonData = JSON.parse(data);
      const result = formatPlutilStyle(jsonData, originalInput || "");
      // printout last symbol
      console.log(result[result.length - 1]);
      return result;
    },
  });
}
