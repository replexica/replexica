import _ from 'lodash';
import { BucketLoader } from "./_base";

export const xcodeLoader = (
  locale: string,
  loader: BucketLoader<void, Record<string, any>>,
): BucketLoader<void, Record<string, any>> => ({
  async load() {
    const input = await loader.load();
    const resultData: Record<string, any> = {};

    for (const [translationKey, _translationEntity] of Object.entries(input.strings)) {
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
  async save(payload) {
    const input = await loader.load();

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
        const originalVariations = input.strings[key]?.localizations?.[locale]?.variations?.plural || {};
        const updatedVariations: any = {};

        for (const form in originalVariations) {
          if (form in value) {
            updatedVariations[form] = {
              stringUnit: {
                state: 'translated',
                value: value[form],
              },
            };
          }
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

    const resultData = _.merge({}, input, langDataToMerge);
    await loader.save(resultData);
  },
});