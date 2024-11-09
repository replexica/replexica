import * as xliff2js from 'xliff/xliff2js';
import * as js2xliff from 'xliff/js2xliff';

const xliff2jsAny = xliff2js as any;
const js2xliffAny = js2xliff as any;



import { ILoader } from "./_types";
import { createLoader } from './_utils';

// const xliff2jsAsAny: any = xliff2js;
// const js2xliffAsAny: any = js2xliff;

export default function createXliffLoader(): ILoader<string, Record<string, any>> {
  return createLoader({
    async pull(locale, input) {
      const js = await xliff2jsAny(input)
      return js || {};
    },
    async push(locale, payload) {      
      return await js2xliffAny(payload);
    }
  });
}
