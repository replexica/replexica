import prettier, { Options } from "prettier";
import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export type PrettierLoaderOptions = {
  parser: Options["parser"];
  alwaysFormat?: boolean;
};

export default function createPrettierLoader(options: PrettierLoaderOptions): ILoader<string, string> {
  return createLoader({
    async pull(locale, data) {
      return data;
    },
    async push(locale, data) {
      const prettierConfig = await loadPrettierConfig();
      if (!prettierConfig && !options.alwaysFormat) {
        return data;
      }

      const result = prettier.format(data, {
        ...(prettierConfig || { printWidth: 2500, bracketSameLine: false }),
        parser: options.parser,
        // For HTML parser, preserve comments and quotes
        ...(options.parser === "html"
          ? {
              htmlWhitespaceSensitivity: "ignore",
              singleQuote: false,
              embeddedLanguageFormatting: "off",
            }
          : {}),
      });

      return result;
    },
  });
}

async function loadPrettierConfig() {
  try {
    const config = await prettier.resolveConfig(process.cwd());
    return config;
  } catch (error) {
    return {};
  }
}
