import { BucketLoader } from './_base';

export const xcodeStringsLoader = (): BucketLoader<string, Record<string, string>> => ({
  async load(text: string) {
    const lines = text.split('\n');
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

  async save(payload: Record<string, string>) {
    const lines = Object.entries(payload).map(([key, value]) => {
      const escapedValue = escapeXcodeString(value);
      return `"${key}" = "${escapedValue}";`;
    });
    return lines.join('\n');
  }
});

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
