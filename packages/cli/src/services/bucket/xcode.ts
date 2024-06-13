import _ from 'lodash';
import { BucketPayload, IBucketProcessor } from "./core";
import { BaseBucketProcessor } from "./base";

export class XcodeBucketProcessor extends BaseBucketProcessor implements IBucketProcessor {
  protected override _validateBucketPath(bucketPath: string): void {
    if (!bucketPath.endsWith('.xcstrings')) {
      throw new Error(`Unknown bucket path: ${bucketPath}. Xcode bucket path must end with '.xcstrings'.`);
    }
  }

  protected override _resolveDataFilePath(): string {
    return this.bucketPath;
  }

  protected override async _deserializeData(content: string): Promise<Record<string, any>> {
    const parsed = JSON.parse(content);
    return parsed;
  }

  protected override async _serializeDataContent(data: Record<string, any>): Promise<string> {
    return JSON.stringify(data, null, 2);
  }

  protected async _postLoad(payload: BucketPayload, locale: string): Promise<BucketPayload> {
    const parsed = payload.data;

    const resultData: Record<string, any> = {};

    for (const [translationKey, _translationEntity] of Object.entries(parsed.strings)) {
      const rootTranslationEntity = _translationEntity as any;
      const langTranslationEntity = rootTranslationEntity?.localizations?.[locale];
      if (langTranslationEntity) {
        if ('stringUnit' in langTranslationEntity) {
          resultData[translationKey] = langTranslationEntity.stringUnit.value;
        } else if ('variations' in langTranslationEntity) {
          if ('plural' in langTranslationEntity.variations) {
            resultData[translationKey] = {
              one: langTranslationEntity.variations.plural.one?.stringUnit?.value || '',
              other: langTranslationEntity.variations.plural.other?.stringUnit?.value || '',
              zero: langTranslationEntity.variations.plural.zero?.stringUnit?.value || '',
            };
          }
        }
      }
    }

    const result: BucketPayload = { ...payload, data: resultData };
    return result;
  }

  protected async _preSave(payload: BucketPayload, locale: string): Promise<BucketPayload> {
    const existingLangData = await this._loadData(locale);

    const langDataToMerge: any = {};
    langDataToMerge.strings = {};

    for (const [key, value] of Object.entries(payload.data)) {
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
        langDataToMerge.strings[key] = {
          extractionState: 'manual',
          localizations: {
            [locale]: {
              variations: {
                plural: {
                  one: {
                    stringUnit: {
                      state: 'translated',
                      value: value.one,
                    },
                  },
                  other: {
                    stringUnit: {
                      state: 'translated',
                      value: value.other,
                    },
                  },
                  zero: {
                    stringUnit: {
                      state: 'translated',
                      value: value.zero,
                    },
                  },
                },
              },
            },
          },
        };
      }
    }

    const resultData = _.merge({}, existingLangData, langDataToMerge);

    return {
      data: resultData,
      meta: payload.meta,
    };
  }
}
