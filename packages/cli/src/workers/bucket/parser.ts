import { parseStringPromise, Builder } from 'xml2js';
import YAML from 'yaml';
import _ from 'lodash';
import GrayMatter from 'gray-matter';

export interface IBucketParser {
  deserialize: (locale: string, content: any) => Promise<Record<string, string>>;
  serialize: (locale: string, content: Record<string, string>) => Promise<any>;
}

export function createJsonParser(): IBucketParser {
  return {
    async deserialize(locale: string, content: string) {
      return JSON.parse(content);
    },
    async serialize(locale: string, payload: Record<string, string>) {
      return JSON.stringify(payload, null, 2);
    }
  };
}

export function createMarkdownParser(): IBucketParser {
  // Define markdown section starter patterns
  const sectionStarters = [
    // Matches headings
    /^#+\s.*$/gm, 
    // Matches dash dividers
    /^[-]{3,}$/gm, 
    // Matches equals dividers
    /^[=]{3,}$/gm, 
    // Matches asterisk dividers
    /^[*]{3,}$/gm, 
    // Matches images that take up a line
    /^!\[.*\]\(.*\)$/gm,
    // Matches links that take up a line
    /^\[.*\]\(.*\)$/gm,
  ];

  return {
    async deserialize(locale: string, rawContent: string) {
      const fmContent = GrayMatter(rawContent);

      const attributes = fmContent.data;
      const content = fmContent.content;

      // Combine all patterns into a single regex
      const combinedPattern = new RegExp(sectionStarters.map(pattern => `(${pattern.source})`).join('|'), 'gm');

      // Split content into sections based on the combined regex
      const sections = content.split(combinedPattern).filter(Boolean);

      // Group sections into a record with section index as key
      const bodyPartial: Record<string, string> = sections.reduce((acc, section, index) => ({
        ...acc,
        [`markdown-line-${index}`]: section,
      }), {} as any);

      // Attributes partial, if any, prefixed with frontmatter-attribute-[key]
      const attributesPartial = Object.entries(attributes).reduce((acc, [key, value]) => ({
        ...acc,
        [`frontmatter-attribute-${key}`]: value,
      }), {} as any);

      const result = {
        ...bodyPartial,
        ...attributesPartial,
      };

      return result;
    },
    async serialize(locale: string, content: Record<string, string>) {
      const body = Object
        .entries(content)
        .filter(([key]) => key.startsWith('markdown-line-'))
        .map(([, value]) => value)
        .join('');

      const attributes = Object
        .entries(content)
        .filter(([key]) => key.startsWith('frontmatter-attribute-'))
        .reduce((acc, [key, value]) => ({
          ...acc,
          [key.replace('frontmatter-attribute-', '')]: value,
        }), {} as any);

      const result = GrayMatter.stringify(body, attributes);

      return result;
    },
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