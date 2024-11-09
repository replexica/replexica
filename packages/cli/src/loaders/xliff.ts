const xliff2js: any = require('xliff/xliff2js');
const js2xliff: any = require('xliff/js2xliff');
import { ILoader } from "./_types";
import { createLoader } from './_utils';


export default function createXliffLoader(): ILoader<string, Record<string, any>> {
  return createLoader({
    async pull(locale, input) {
      const js = await xliff2js(input)
      return js || {};
    },
    async push(locale, payload) {      
      return await js2xliff(payload);
    }
  });
}
