import { ILoader } from "./_types";
import { createLoader } from './_utils';

export default function createPropertiesLoader(): ILoader<string, Record<string, any>> {
  return createLoader({
    async pull(locale, text) {
      const result: Record<string, string> = {};
      const lines = text.split('\n');

      for (const line of lines) {
        const trimmed = line.trim();

        // Skip empty lines and comments
        if (isSkippableLine(trimmed)) {
          continue;
        }

        const { key, value } = parsePropertyLine(trimmed);
        if (key) {
          result[key] = value;
        }
      }

      return result;
    },
    async push(locale, payload) {
      const result = Object.entries(payload)
        .filter(([_, value]) => value != null)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      return result;
    }
  });
}

function isSkippableLine(line: string): boolean {
  return !line || line.startsWith('#');
}

function parsePropertyLine(line: string): { key: string; value: string } {
  const [key, ...valueParts] = line.split('=');
  return {
    key: key?.trim() || '',
    value: valueParts.join('=').trim()
  };
}
