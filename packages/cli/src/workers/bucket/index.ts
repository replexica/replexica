import { allLocalesSchema, bucketTypeSchema } from '@replexica/spec';
import Z from 'zod';
import path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import { MD5 } from 'object-hash';

export interface IBucketStorage {
  load: (locale: Z.infer<typeof allLocalesSchema>, butcketPath: string) => Promise<any>;
  save: (locale: Z.infer<typeof allLocalesSchema>, butcketPath: string, content: any) => Promise<void>;
}

export class FileBucketStorage implements IBucketStorage {
  constructor(private pathResolver: BucketPathResolver) { }

  async load(locale: Z.infer<typeof allLocalesSchema>, bucketPath: string) {
    const localeFilePath = await this.pathResolver(locale, bucketPath);
    return fs.existsSync(localeFilePath) ? fs.readFileSync(localeFilePath, "utf8") : null;
  }

  async save(locale: Z.infer<typeof allLocalesSchema>, bucketPath: string, content: any) {
    const localeFilePath = await this.pathResolver(locale, bucketPath);
    fs.mkdirSync(path.dirname(localeFilePath), { recursive: true });
    fs.writeFileSync(localeFilePath, content, "utf8");
  }
}

export interface IBucketParser {
  deserialize: (locale: string, content: any) => Promise<Record<string, string>>;
  serialize: (locale: string, content: Record<string, string>) => Promise<any>;
}

export class JsonBucketParser implements IBucketParser {
  async deserialize(locale: string, content: any) {
    return JSON.parse(content);
  }

  async serialize(locale: string, content: Record<string, string>) {
    return JSON.stringify(content, null, 2);
  }
}

export class MarkdownBucketParser implements IBucketParser {
  async deserialize(locale: string, content: any) {
    // Split content in sections. 
    // Every header, no matter the level, is considered a beginning of a new section.
    // Header must remain in the section.
    const sections = String(content).split(/^#+\s/gm).filter(Boolean);

    const result: Record<string, string> = {};
    for (const section of sections) {
      const sectionKey = MD5(section);
      result[sectionKey] = section;
    }

    return result;
  }

  async serialize(locale: string, content: Record<string, string>) {
    return Object.values(content).join('\n');
  }
}

export class YamlBucketParser implements IBucketParser {
  async deserialize(locale: string, content: any) {
    return YAML.parse(content);
  }

  async serialize(locale: string, content: Record<string, string>) {
    return YAML.stringify(content);
  }
}

export class YamlRootKeyBucketParser implements IBucketParser {
  async deserialize(locale: string, content: any) {
    return YAML.parse(content)?.[locale] || {};
  }

  async serialize(locale: string, content: Record<string, string>) {
    return YAML.stringify({ [locale]: content });
  }
}

export class XcodeBucketParser extends JsonBucketParser {
  private _existingData: any;

  async deserialize(locale: string, content: any) {
    this._existingData = await super.deserialize(locale, content);

    const resultData: Record<string, any> = {};

    for (const [translationKey, _translationEntity] of Object.entries(this._existingData.strings)) {
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
  }

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

    const resultData = { ...this._existingData, ...langDataToMerge };
    return JSON.stringify(resultData, null, 2);
  }
}

export type BucketPathResolver = {
  (locale: Z.infer<typeof allLocalesSchema>, bucketPath: string): Promise<string>;
}

export async function plainBucketPathResolver(locale: Z.infer<typeof allLocalesSchema>, bucketPath: string) {
  return path.join(process.cwd(), bucketPath);
}

export async function patternBucketPathResolver(locale: Z.infer<typeof allLocalesSchema>, bucketPath: string) {
  if (!bucketPath.includes('[locale]')) {
    throw new Error('Bucket path must contain [locale] placeholder');
  }

  const localePath = bucketPath.replace('[locale]', locale);
  const result = plainBucketPathResolver(locale, localePath);

  return result;
}

export type BucketProcessorParams = {
  storage: IBucketStorage;
  parser: IBucketParser;
  pathResolver: BucketPathResolver;
};

export function composeBucketProcessor(bucketPath: string, params: BucketProcessorParams) {
  return {
    async load(locale: Z.infer<typeof allLocalesSchema>) {
      const content = await params.storage.load(locale, bucketPath);
      if (!content) { return {}; }

      const payload = await params.parser.deserialize(locale, content);
      return payload;
    },
    async save(locale: Z.infer<typeof allLocalesSchema>, payload: Record<string, string>) {
      const serialized = await params.parser.serialize(locale, payload);
      await params.storage.save(locale, bucketPath, serialized);
    },
  };
}

export function createBucketProcessor(bucketType: Z.infer<typeof bucketTypeSchema>, bucketPath: string) {
  switch (bucketType) {
    default:
      throw new Error(`Unsupported bucket type: ${bucketType}`);
    case 'json':
      return composeBucketProcessor(bucketPath, {
        storage: new FileBucketStorage(patternBucketPathResolver),
        parser: new JsonBucketParser(),
        pathResolver: patternBucketPathResolver,
      })
    case 'yaml':
      return composeBucketProcessor(bucketPath, {
        storage: new FileBucketStorage(patternBucketPathResolver),
        parser: new YamlBucketParser(),
        pathResolver: patternBucketPathResolver,
      });
    case 'yaml-root-key':
      return composeBucketProcessor(bucketPath, {
        storage: new FileBucketStorage(patternBucketPathResolver),
        parser: new YamlRootKeyBucketParser(),
        pathResolver: patternBucketPathResolver,
      });
    case 'markdown':
      return composeBucketProcessor(bucketPath, {
        storage: new FileBucketStorage(patternBucketPathResolver),
        parser: new MarkdownBucketParser(),
        pathResolver: patternBucketPathResolver,
      });
  }
}
