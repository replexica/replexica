import { parse, createEditor } from 'properties-parser';
import { BucketLoader } from './_base';

export const propertiesLoader = (): BucketLoader<string, Record<string, string>> => ({
  async load(text: string) {
    return parse(text || '');
  },
  async save(payload) {
    const editor = createEditor();

    // Update or add new key-value pairs
    for (const [key, value] of Object.entries(payload)) {
      editor.set(key, value);
    }

    return editor.toString();
  }
});
