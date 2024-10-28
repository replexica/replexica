import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createXcodeStringsLoader(): ILoader<string, Record<string, any>> {
  return createLoader({
    async pull(locale, input) {
      const lines = input.split('\n');
      const result: Record<string, string> = {};

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('//')) {
          const match = trimmedLine.match(/^"(.+)"\s*=\s*"(.+)";$/);
          if (match) {
            const [, key, value] = match;
            result[key] = unescapeXcodeString(value);
          }
        }
      }

      return result;
    },
    async push(locale, payload) {
      const lines = Object.entries(payload).map(([key, value]) => {
        const escapedValue = escapeXcodeString(value);
        return `"${key}" = "${escapedValue}";`;
      });
      return lines.join('\n');
    }
  })
}

function unescapeXcodeString(str: string): string {
  return str
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\\\/g, '\\');
}

function escapeXcodeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
}
