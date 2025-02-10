import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createNewLineLoader(): ILoader<string, string> {
  return createLoader({
    async pull(locale, input) {
      return input;
    },
    async push(locale, data, originalInput) {
      if (!data) return "";

      // Remove any existing final newline
      const trimmed = data.replace(/[\r\n]+$/, "");

      // If original had final newline, add it back with same ending type
      if (originalInput?.match(/[\r\n]$/)) {
        const ending = originalInput?.includes("\r\n") ? "\r\n" : originalInput?.includes("\r") ? "\r" : "\n";
        return trimmed + ending;
      }

      return trimmed;
    },
  });
}
