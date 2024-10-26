import { parse, createEditor } from 'properties-parser';
import { ILoader } from "./_types";
import { createLoader } from './_utils';

export default function createPropertiesLoader(): ILoader<string, Record<string, any>> {
  return createLoader({
    async pull(locale, text) {
      return parse(text || '');
    },
    async push(locale, payload) {
      const editor = createEditor();

      for (const [key, value] of Object.entries(payload)) {
        editor.set(key, value);
      }

      return editor.toString();
    }
  });
}
