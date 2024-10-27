import prettier, { Options } from 'prettier';
import { ILoader } from './_types';
import { createLoader } from './_utils';

export default function createPrettierLoader(parser: Options['parser']): ILoader<string, string> {  
  return createLoader({
    async pull(locale, data) {
      return data;
    },
    async push(locale, data) {
      const prettierConfig = await loadPrettierConfig();
      if (!prettierConfig) { return data; }

      const result = prettier.format(data, { 
        ...prettierConfig,
        parser 
      });

      return result;
    }
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
