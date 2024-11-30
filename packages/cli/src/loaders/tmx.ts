import { ILoader } from "./_types";
import { createLoader } from './_utils';
import { DOMParser, XMLSerializer } from 'xmldom';
import { Builder, parseStringPromise } from "xml2js";


function normalizeLocale(locale: string): string {
  
  const localeMapping: Record<string, string> = {
    ru: "ru",
    fr: "fr",
    es: "es-ES",
    de: "de",
    "zh-Hans": "zh-Hans",
    ko: "ko",
    ja: "ja",
    it: "it",
    ar: "ar"
  };
  if (!localeMapping[locale]) {
    console.warn(`Locale "${locale}" is not recognized. Using original value.`);
  }
  
  return localeMapping[locale] || locale;
}



export default function createTmxLoader(): ILoader<string, Record<string, any>> {
  return createLoader({
    async pull(locale, input) {        
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(input, 'text/xml');
      const translationUnits = xmlDoc.getElementsByTagName('tu');
      const parsedUnits:any = {};
    
      for (let i = 0; i < translationUnits.length; i++) {
        const tu = translationUnits[i];
        const key = `body/tu/${i + 1}`;
    
        const translationElements = tu.getElementsByTagName('tuv');
        for (let j = 0; j < translationElements.length; j++) {
          const translationElement = translationElements[j];
          const langCode = translationElement.getAttribute('xml:lang');
          const segmentElement = translationElement.getElementsByTagName('seg')[0];
    
          if (langCode?.includes(locale) && segmentElement) {
            parsedUnits[key] = segmentElement.textContent || '';
            break;
          }
        }
      }
    
      return parsedUnits;
    },
    async push(locale, payload, originalInput: string) {
      const parsedXml = await parseStringPromise(originalInput);

  const tuElements = parsedXml?.tmx?.body?.[0]?.tu ?? [];

  Object.entries(payload).forEach(([key, translationText]) => {
    const [, , tuIndex] = key.split("/");
    const index = parseInt(tuIndex, 10) - 1;
    const tuElement = tuElements[index];
    if (!tuElement) return;

    const existingTuv = tuElement.tuv.find((tuv: any) => tuv.$["xml:lang"] === "en-US");
    if (!existingTuv || !existingTuv.$) return;

    const creationDate = existingTuv.$.creationdate || "";
    const lastUsageDate = existingTuv.$.lastusagedate || "";

    const normalizedLocale = normalizeLocale(locale);
    const newTuv = {
      $: {
        "xml:lang": normalizedLocale,
        creationdate: creationDate,
        lastusagedate: lastUsageDate,
      },
      seg: [translationText],
    };

    const existingTranslation = tuElement.tuv.find((tuv: any) => tuv.$["xml:lang"] === normalizedLocale);
    if (existingTranslation) {
      existingTranslation.seg = [translationText];
    } else {
      tuElement.tuv.push(newTuv);
    }
  });

  const builder = new Builder({
    xmldec: { version: "1.0", encoding: "UTF-8" },
    renderOpts: { pretty: true, indent: "  ", newline: "\n" },
    headless: false,
  });
  
  return builder.buildObject(parsedXml);
}
  });
}
