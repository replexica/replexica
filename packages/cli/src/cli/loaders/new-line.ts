import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export type NewLineLoaderOptions = "lf" | "crlf" | "cr" | "auto";

export default function createNewLineLoader(options: NewLineLoaderOptions = "auto"): ILoader<string, string> {
  const getLineEnding = (originalInput: string) => {
    switch (options) {
      case "lf":
        return "\n";
      case "crlf":
        return "\r\n";
      case "cr":
        return "\r";
      case "auto":
        // Use platform-specific line endings
        return process.platform === "win32" ? "\r\n" : "\n";
      default:
        // Detect original line endings, fallback to LF if can't detect
        if (originalInput.includes("\r\n")) return "\r\n";
        if (originalInput.includes("\r")) return "\r";
        return "\n";
    }
  };

  return createLoader({
    async pull(locale, input) {
      // Normalize line endings to LF for internal processing
      return input.replace(/\r\n|\r/g, "\n");
    },
    async push(locale, data, originalInput) {
      if (!data) return "";

      // Convert line endings to the specified format or preserve original
      const lineEnding = getLineEnding(originalInput || "");
      return data.replace(/\n/g, lineEnding);
    },
  });
}
