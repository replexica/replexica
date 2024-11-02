import { ILoader } from "./_types";
import { createLoader } from './_utils';

export default function createPoLoader(): ILoader<string, Record<string, any>> {
  return createLoader({
    async pull(locale, text) {
      const result: Record<string, string> = {};
      const lines = text.split('\n');
      let currentKey = '';
      let currentValue = '';

      for (const line of lines) {
        const trimmed = line.trim();

        // Skip empty lines and comments
        if (isSkippableLine(trimmed)) {
          continue;
        }

        if (trimmed.startsWith('msgid')) {
          // If we have a current key, save it before moving to the next
          if (currentKey) {
            result[currentKey] = currentValue;
          }
          currentKey = parseMsgId(trimmed);
          currentValue = ''; // Reset current value
        } else if (trimmed.startsWith('msgstr')) {
          currentValue = parseMsgStr(trimmed);
        }
      }

      // Save the last key-value pair
      if (currentKey) {
        result[currentKey] = currentValue;
      }

      return result;
    },
    async push(locale, payload) {
      const result = Object.entries(payload)
        .map(([key, value]) => {
          return `msgid "${key}"\nmsgstr "${value}"`;
        })
        .join('\n\n');

      return result;
    }
  });
}

function isSkippableLine(line: string): boolean {
  return !line || line.startsWith('#');
}

function parseMsgId(line: string): string {
  const match = line.match(/msgid "(.*)"/);
  return match ? match[1] : '';
}

function parseMsgStr(line: string): string {
  const match = line.match(/msgstr "(.*)"/);
  return match ? match[1] : '';
}
