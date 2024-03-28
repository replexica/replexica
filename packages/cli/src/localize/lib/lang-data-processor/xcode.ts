import fs from 'fs/promises';
import _ from "lodash";
import { BaseLangDataProcessor, ILangDataProcessor, LangDataNode } from "./base.js";

export class XcodeLangDataProcessor extends BaseLangDataProcessor implements ILangDataProcessor {
  override async validatePath(path: string): Promise<void> {
    if (!path.endsWith('.xcstrings')) { throw new Error('Xcode dictionary must have .xcstrings file extension'); }    
  }

  async loadLangJson(filePath: string, lang: string): Promise<Record<string, string>> {
    await this.validatePath(filePath);

    const fileExists = fs.stat(filePath).then(() => true).catch(() => false);
    if (!fileExists) {
      return {};
    } else {
      const fileContent = await fs.readFile(filePath, 'utf8');
      const langData = await this.parseLangData(fileContent, lang);
      const result = await this.flatten(langData, lang);
      return result;
    }
  }

  async saveLangJson(filePath: string, lang: string, record: Record<string, string>): Promise<void> {
    await this.validatePath(filePath);

    const fileExists = await fs.stat(filePath).then(() => true).catch(() => false);
    if (!fileExists) { throw new Error('Xcode translation was not found.'); }

    const fileContent = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(fileContent);

    const langData = await this.unflatten(record, lang);
    const langDataToMerge = await this.serializeLangDataPartial(langData, lang);

    const result = _.mergeWith(parsed, langDataToMerge, (objValue, srcValue) => {
      if (_.isObject(objValue)) {
        // If the value is an object, merge it deeply
        return _.merge(objValue, srcValue);
      }
    });

    // Write the file
    await fs.writeFile(filePath, JSON.stringify(result, null, 2));
  }

  private async parseLangData(fileContent: string, lang: string): Promise<LangDataNode> {
    const parsed = JSON.parse(fileContent);

    const result: LangDataNode = {};
    for (const [translationKey, _translationEntity] of Object.entries(parsed.strings)) {
      const rootTranslationEntity = _translationEntity as any;
      const langTranslationEntity = rootTranslationEntity?.localizations?.[lang];
      if (langTranslationEntity) {
        if ('stringUnit' in langTranslationEntity) {
          result[translationKey] = langTranslationEntity.stringUnit.value;
        } else if ('variations' in langTranslationEntity) {
          if ('plural' in langTranslationEntity.variations) {
            result[translationKey] = {
              one: langTranslationEntity.variations.plural.one?.stringUnit?.value || '',
              other: langTranslationEntity.variations.plural.other?.stringUnit?.value || '',
              zero: langTranslationEntity.variations.plural.zero?.stringUnit?.value || '',
            };
          }
        }
      }
    }

    return result;
  }

  private async serializeLangDataPartial(langData: LangDataNode, lang: string): Promise<any> {
    const langDataToMerge: any = {};
    langDataToMerge.strings = {};

    for (const [key, value] of Object.entries(langData)) {
      if (typeof value === 'string') {
        langDataToMerge.strings[key] = {
          extractionState: 'manual',
          localizations: {
            [lang]: {
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
            [lang]: {
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

    return langDataToMerge;
  }
}
