import { ILoader } from "./_types";
import { createLoader } from "./_utils";
import _ from 'lodash';

export default function createXcodeXcstringsLoader(): ILoader<Record<string, any>, Record<string, any>> {
  return createLoader({
    async pull(locale, rawData) {
      const resultData: Record<string, any> = {};

      for (const [translationKey, _translationEntity] of Object.entries(rawData.strings)) {
        const rootTranslationEntity = _translationEntity as any;
        const langTranslationEntity = rootTranslationEntity?.localizations?.[locale];
        if (langTranslationEntity) {
          if ('stringUnit' in langTranslationEntity) {
            resultData[translationKey] = langTranslationEntity.stringUnit.value;
          } else if ('variations' in langTranslationEntity) {
            if ('plural' in langTranslationEntity.variations) {
              resultData[translationKey] = {};
              const pluralForms = langTranslationEntity.variations.plural;
              for (const form in pluralForms) {
                if (pluralForms[form]?.stringUnit?.value) {
                  resultData[translationKey][form] = pluralForms[form].stringUnit.value;
                }
              }
            }
          }
        }
      }

      return resultData;
    },
    async push(locale, payload, rawData) {
      const langDataToMerge: any = {};
      langDataToMerge.strings = {};

      for (const [key, value] of Object.entries(payload)) {
        if (typeof value === 'string') {
          langDataToMerge.strings[key] = {
            extractionState: 'manual',
            localizations: {
              [locale]: {
                stringUnit: {
                  state: 'translated',
                  value,
                },
              },
            },
          };
        } else {
          const originalVariations = rawData.strings[key]?.localizations?.[locale]?.variations?.plural || {};
          const updatedVariations: any = {};

          for (const form in value) {
            updatedVariations[form] = {
              stringUnit: {
                state: 'translated',
                value: value[form],
              },
            };
          }

          langDataToMerge.strings[key] = {
            extractionState: 'manual',
            localizations: {
              [locale]: {
                variations: {
                  plural: updatedVariations,
                },
              },
            },
          };
        }
      }

      const result = _.merge({}, rawData, langDataToMerge);
      return result;
    }
  })
}
