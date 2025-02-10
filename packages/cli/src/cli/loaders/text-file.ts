import fs from "fs/promises";
import path from "path";
import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createTextFileLoader(pathPattern: string): ILoader<void, string> {
  return createLoader({
    async pull(locale) {
      const result = await readFileForLocale(pathPattern, locale);
      const trimmedResult = result.trim();
      return trimmedResult;
    },
    async push(locale, data, _, originalLocale) {
      const draftPath = pathPattern.replace("[locale]", locale);
      const finalPath = path.resolve(draftPath);

      // Create parent directories if needed
      const dirPath = path.dirname(finalPath);
      await fs.mkdir(dirPath, { recursive: true });

      const trimmedPayload = data.trim();

      // Add trailing new line if needed
      const trailingNewLine = await getTrailingNewLine(pathPattern, locale, originalLocale);
      let finalPayload = trimmedPayload + trailingNewLine;

      await fs.writeFile(finalPath, finalPayload, {
        encoding: "utf-8",
        flag: "w",
      });
    },
  });
}

async function readFileForLocale(pathPattern: string, locale: string) {
  const draftPath = pathPattern.replace("[locale]", locale);
  const finalPath = path.resolve(draftPath);
  const exists = await fs
    .access(finalPath)
    .then(() => true)
    .catch(() => false);
  if (!exists) {
    return "";
  }
  return fs.readFile(finalPath, "utf-8");
}

async function getTrailingNewLine(pathPattern: string, locale: string, originalLocale: string) {
  let templateData = await readFileForLocale(pathPattern, locale);
  if (!templateData) {
    templateData = await readFileForLocale(pathPattern, originalLocale);
  }

  if (templateData?.match(/[\r\n]$/)) {
    const ending = templateData?.includes("\r\n") ? "\r\n" : templateData?.includes("\r") ? "\r" : "\n";
    return ending;
  }
  return "";
}
