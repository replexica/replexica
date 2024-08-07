import YAML from 'yaml';
import { createLoader } from './_base';

export const yamlLoader = createLoader<string, Record<string, any>>({
  async load(text: string) {
    return YAML.parse(text);
  },
  async save(payload) {
    return YAML.stringify(payload);
  },
});
