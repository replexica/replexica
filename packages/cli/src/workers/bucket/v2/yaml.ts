import YAML from 'yaml';
import { BucketLoader } from './_base';

export const yamlLoader = (): BucketLoader<string, Record<string, any>> => ({
  async load(text: string) {
    return YAML.parse(text || '{}');
  },
  async save(payload) {
    return YAML.stringify(payload, {
      lineWidth: -1,
    });
  }
});