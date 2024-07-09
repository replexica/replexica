import { parseStringPromise, Builder } from 'xml2js';
import YAML from 'yaml';
import _ from 'lodash';

export interface IBucketParser {
  deserialize: (locale: string, content: any) => Promise<Record<string, string>>;
  serialize: (locale: string, content: Record<string, string>) => Promise<any>;
}

export function createJsonParser(): IBucketParser {
  return {
    async deserialize(locale: string, content: any) {
      return JSON.parse(content);
    },
    async serialize(locale: string, content: Record<string, string>) {
      return JSON.stringify(content, null, 2);
    }
  };
}

// Divider is a double newline
export function createNewLineMarkdownParser(): IBucketParser {
  return {
    async deserialize(locale: string, content: string) {
      const lines = content.split('\n\n');
      const result: Record<string, string> = {};
      for (let i = 0; i < lines.length; i++) {
        const text = lines[i];
        const key = i;
        result[key] = text;
      }
      return result;
    },
    async serialize(locale: string, content: Record<string, string>) {
      return Object
        .values(content)
        .join('\n\n');
    }
  };
}

export function createMarkdownParser(): IBucketParser {
  return {
    async deserialize(locale: string, content: string) {
      // Split the markdown content into chunks.
      // The following block types mark the beginning of a new chunk, and are included in the new chunk as well:
      // - Heading – any type of heading, #, ##, etc.
      // The result is a dictionary where the key is the md5 of the chunk, and the value is the chunk content.

      // All lines in the content
      const lines = content.split('\n');
      // Lines that are headings
      const splittingLines = lines.filter((line) => line.trim().startsWith('#'));
      // The groups of text that start with a heading
      let groupIndex = 0;
      const chunk: string[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (splittingLines.includes(line)) {
          if (chunk.length > 0) {
            groupIndex++;
          }
        }
        if (!chunk[groupIndex]) {
          chunk[groupIndex] = '';
        }
        chunk[groupIndex] += line + '\n';
      }
      const result: Record<string, string> = {};
      for (let i = 0; i < chunk.length; i++) {
        const text = chunk[i];
        const key = i;
        result[key] = text;
      }

      return result;
    },
    async serialize(locale: string, content: Record<string, string>) {
      let result = Object
        .values(content)
        .join('');
      
      result = result.trim() + '\n';

      return result;
    }
  };
}

export type YamlBucketParserParams = {
  rootKey: boolean;
};
export function createYamlParser(params: YamlBucketParserParams): IBucketParser {
  return {
    async deserialize(locale: string, content: any) {
      const parsed = YAML.parse(content);
      return params.rootKey ? parsed[locale] : parsed;
    },
    async serialize(locale: string, content: Record<string, string>) {
      return YAML.stringify(params.rootKey ? { [locale]: content } : content);
    }
  };
}

export function createXcodeParser() {
  let _existingData: any;
  return {
    async deserialize(locale: string, content: any) {
      _existingData = await JSON.parse(content);

      const resultData: Record<string, any> = {};

      for (const [translationKey, _translationEntity] of Object.entries(_existingData.strings)) {
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

      return resultData;
    },
    async serialize(locale: string, payload: Record<string, any>): Promise<string> {
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

      const resultData = _.merge({}, _existingData, langDataToMerge);
      return JSON.stringify(resultData, null, 2);
    }
  };
}

export function createAndroidParser(): IBucketParser {
  return {
    async deserialize(locale: string, content: any) {
      const parsedResult = await parseStringPromise(content);
      const resources = parsedResult.resources;

      const result: Record<string, any> = {};

      // Parse single strings
      if (resources.string) {
        resources.string.forEach((item: any) => {
          result[item.$.name] = item._ || '';
        });
      }

      // Parse string arrays
      if (resources['string-array']) {
        resources['string-array'].forEach((item: any) => {
          result[item.$.name] = item.item.map((i: any) => i._ || '');
        });
      }

      // Parse plurals
      if (resources.plurals) {
        resources.plurals.forEach((item: any) => {
          const plurals: Record<string, string> = {};
          item.item.forEach((i: any) => {
            plurals[i.$.quantity] = i._ || '';
          });
          result[item.$.name] = plurals;
        });
      }

      return result;
    },

    async serialize(locale: string, content: Record<string, any>) {
      const builder = new Builder({ headless: true })
      const resources: any = {
        resources: {
          string: [],
          'string-array': [],
          plurals: [],
        },
      };

      for (const key in content) {
        if (typeof content[key] === 'string') {
          resources.resources.string.push({ $: { name: key }, _: content[key] });
        } else if (Array.isArray(content[key])) {
          resources.resources['string-array'].push({
            $: { name: key },
            item: content[key].map((value: string) => ({ _: value })),
          });
        } else if (typeof content[key] === 'object') {
          const pluralItems = [];
          for (const quantity in content[key]) {
            pluralItems.push({
              $: { quantity },
              _: content[key][quantity],
            });
          }
          resources.resources.plurals.push({
            $: { name: key },
            item: pluralItems,
          });
        }
      }

      // Remove empty sections if they have no items
      if (resources.resources.string.length === 0) {
        delete resources.resources.string;
      }
      if (resources.resources['string-array'].length === 0) {
        delete resources.resources['string-array'];
      }
      if (resources.resources.plurals.length === 0) {
        delete resources.resources.plurals;
      }

      const xml = builder.buildObject(resources);
      return xml;
    },
  };
}