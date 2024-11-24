import { parseStringPromise, Builder } from 'xml2js';
import { ILoader } from './_types';
import { createLoader } from './_utils';


function normalizeXMLString(xmlString: string): string {
  return xmlString
      .replace(/\s+/g, ' ')         
      .replace(/>\s+</g, '><')
      .replace("\n", "")
      .trim();
}

export default function createXmlLoader(): ILoader<string, Record<string, any>> {
  return createLoader({
    async pull(locale, input) {
      let result: Record<string, any> = {};
      
      try {
        const parsed = await parseStringPromise(input, { explicitArray: false, mergeAttrs:false, normalize:true, preserveChildrenOrder:true, normalizeTags: true, includeWhiteChars:true, trim: true });
        result = parsed;
      } catch (error) {
        console.error("Failed to parse XML:", error);
        result = {};
      }
      
      return result;
    },
    
    async push(locale, data) {
      try {
        const builder = new Builder({ headless: true });        
        const xmlOutput = builder.buildObject(data);
        const expectedOutput = normalizeXMLString(xmlOutput);
        return expectedOutput;
      } catch (error) {
        console.error("Failed to build XML:", error);
        return '';
      }
    }
  });
}
