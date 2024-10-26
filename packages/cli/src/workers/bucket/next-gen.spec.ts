import fs from 'fs/promises';
import { flatten, unflatten } from 'flat';
import { describe, it, expect } from 'vitest';

// Base
export interface ILoaderDefinition<I, O> {
  pull(rawData: I, locale: string): Promise<O>;
  push(data: O, locale: string, rawData: I): Promise<I>;

  onStart?(): Promise<void>;
  onProgress?(current: number, total: number): Promise<void>;
  onEnd?(): Promise<void>;
}

export interface ILoader<I, O> extends ILoaderDefinition<I, O> {
  setLocale(locale: string): this;

  pull(rawData: I): Promise<O>;
  push(data: O): Promise<I>;

  onStart(): Promise<void>;
  onProgress(current: number, total: number): Promise<void>;
  onEnd(): Promise<void>;
}

export function composeLoaders<O>(...loaders: ILoader<any, any>[]): ILoader<void, O> {
  return {
    setLocale(locale: string) {
      for (const loader of loaders) {
        loader.setLocale?.(locale);
      }
      return this;
    },
    pull: async (rawData: any) => {
      let result = rawData;
      for (const loader of loaders) {
        result = await loader.pull(result);
      }
      return result;
    },
    push: async (data: any) => {
      let result = data;
      for (const loader of loaders.reverse()) {
        result = await loader.push(result);
      }
      return result;
    },
    onStart: async () => {
      for (const loader of loaders) {
        await loader.onStart?.();
      }
    },
    onProgress: async (current, total) => {
      for (const loader of loaders) {
        await loader.onProgress?.(current, total);
      }
    },
    onEnd: async () => {
      for (const loader of loaders.reverse()) {
        await loader.onEnd?.();
      }
    },
  };
}

export function createLoader<I, O>(lDefinition: ILoaderDefinition<I, O>): ILoader<I, O> {
  return {
    locale: undefined,
    rawData: undefined,
    setLocale(locale) {
      if (this.locale) { throw new Error('Locale already set'); }
      this.locale = locale;
      return this;
    },
    async pull(rawData) {
      if (!this.locale) { throw new Error('Locale not set'); }
      this.rawData = rawData || null;

      return lDefinition.pull(rawData, this.locale);
    },
    async push(data) {
      if (!this.locale) { throw new Error('Locale not set'); }
      if (this.rawData === undefined) { throw new Error('Cannot push data without pulling first'); }

      return lDefinition.push(data, this.locale, this.rawData);
    },
    async onStart() {
      await lDefinition.onStart?.();
    },
    async onProgress(current, total) {
      await lDefinition.onProgress?.(current, total);
    },
    async onEnd() {
      await lDefinition.onEnd?.();
    },
  } as ILoader<I, O>;
}

// Mock
export function createPassThroughLoader(state: any): ILoader<void, string> {
  return createLoader({
    pull: async () => state.data,
    push: async (data) => {
      state.data = data;
    },
  });
}

// Android
export function createAndroidLoader(): ILoader<string, Record<string, any>> {
  // TODO
}

// Csv
export function createCsvLoader(): ILoader<string, Record<string, string>> {
  // TODO
}

// Flat
export function createFlatLoader(): ILoader<Record<string, any>, Record<string, string>> {
  return createLoader({
    pull: async (rawData, locale) => {
      const flattenedData = flatten(rawData || {}) as Record<string, string>;
      return flattenedData;
    },
    push: async (data, locale) => {
      const unflattenedData = unflatten(data || {}) as Record<string, any>;
      return unflattenedData;
    },
  });
}

// Flutter
export function createFlutterLoader(): ILoader<string, Record<string, any>> {
  // TODO
}

// HTML
export function createHtmlLoader(): ILoader<string, Record<string, any>> {
  // TODO
}

// JSON
export function createJsonLoader(): ILoader<string, Record<string, any>> {
  return createLoader({
    pull: async (rawData, locale) => {
      const data = JSON.parse(rawData);
      return data;
    },
    push: async (data, locale) => {
      const serializedData = JSON.stringify(data);
      return serializedData;
    },
  });
}

// Markdown
export function createMarkdownLoader(): ILoader<string, Record<string, any>> {
  // TODO
}

// Properties
export function createPropertiesLoader(): ILoader<string, Record<string, any>> {
  // TODO
}

// Root key
export function createRootKeyLoader(): ILoader<Record<string, any>, Record<string, any>> {
  return createLoader({
    async pull(rawData, locale) {
      const result = rawData[locale];
      return result;
    },
    async push(data, locale, rawData) {
      const result = {
        ...rawData,
        [locale]: data,
      };
      return result;
    },
  });
}

// Text
export function createTextFileLoader(pathPattern: string): ILoader<void, string> {
  return createLoader({
    pull: async (rawData, locale) => {
      const finalPath = pathPattern.replace('[locale]', locale);
      const data = await fs.readFile(finalPath, 'utf-8');
      return data;
    },
    push: async (data, locale) => {
      const finalPath = pathPattern.replace('[locale]', locale);
      await fs.writeFile(finalPath, data);
    },
  });
}

// Xcode .strings
export function createXcodeStringsLoader(): ILoader<string, Record<string, any>> {
  // TODO
}

// Xcode .stringsdict
export function createXcodeStringsdictLoader(): ILoader<string, Record<string, any>> {
  // TODO
}

// Xcode .xcstrings
export function createXcodeXcstringsLoader(): ILoader<string, Record<string, any>> {
  // TODO
}

// YAML
export function createYamlLoader(): ILoader<string, Record<string, any>> {
  // TODO
}

describe('loader', () => {
  const _mockData = {
    en: {
      messages: {
        greeting: 'Hello',
        farewell: 'Goodbye',
      }
    },
    es: {
      messages: {
        greeting: 'Hola',
        farewell: 'Adios',
      }
    }
  };

  it('should pull and push data', async () => {
    const mockState = {
      data: JSON.stringify(_mockData),
    }
    const loader = composeLoaders<Record<string, string>>(
      createPassThroughLoader(mockState),
      createJsonLoader(),
      createFlatLoader(),
    ).setLocale('en');

    const data = await loader.pull(undefined);

    expect(data).toEqual({
      'en.messages.greeting': 'Hello',
      'en.messages.farewell': 'Goodbye',
      'es.messages.greeting': 'Hola',
      'es.messages.farewell': 'Adios',
    });
  });

  it('should pull data withroot key', async () => {
    const mockState = {
      data: JSON.stringify(_mockData),
    }
    const loader = composeLoaders<Record<string, any>>(
      createPassThroughLoader(mockState),
      createJsonLoader(),
      createRootKeyLoader(),
      createFlatLoader(),
    ).setLocale('en');

    const data = await loader.pull();

    expect(data).toEqual({
      'messages.greeting': 'Hello',
      'messages.farewell': 'Goodbye',
    });
  });

  it('should push data with root key', async () => {
    const mockState = {
      data: JSON.stringify(_mockData),
    }
    const enLoader = composeLoaders<Record<string, any>>(
      createPassThroughLoader(mockState),
      createJsonLoader(),
      createRootKeyLoader(),
      createFlatLoader(),
    ).setLocale('en');
    const frLoader = composeLoaders<Record<string, any>>(
      createPassThroughLoader(mockState),
      createJsonLoader(),
      createRootKeyLoader(),
      createFlatLoader(),
    ).setLocale('fr');

    await enLoader.onStart?.();
    await frLoader.onStart?.();
    
    await enLoader.pull();
    await frLoader.pull();

    await enLoader.onProgress?.(0, 1);
    await frLoader.onProgress?.(0, 1);

    const processedData = {
      'messages.greeting': 'Bonjour',
      'messages.farewell': 'Au revoir',
    };

    await enLoader.onProgress?.(1, 1);
    await frLoader.onProgress?.(1, 1);

    await frLoader.push(processedData);

    await enLoader.onEnd?.();
    await frLoader.onEnd?.();

    expect(mockState.data).toEqual(JSON.stringify({
      en: {
        messages: {
          greeting: 'Hello',
          farewell: 'Goodbye',
        }
      },
      es: {
        messages: {
          greeting: 'Hola',
          farewell: 'Adios',
        }
      },
      fr: {
        messages: {
          greeting: 'Bonjour',
          farewell: 'Au revoir',
        }
      }
    }));
  });
});

(async function main() {
  const localizationEngine = createLocalizationEngine();
  const config = await loadConfig();
  const buckets = await findBuckets();
  for (const [bucketType, bucketPath] of Object.entries(buckets)) {
    const pathPatterns = extractPathPatterns(bucketPath);
    for (const bucketPathPattern of pathPatterns) {
      const sourceLoader = createBucketLoader(bucketType, bucketPathPattern).setLocale(config.locale.source);
      for (const targetLocale of config.locale.targets) {
        const targetLoader = createBucketLoader(bucketType, bucketPathPattern).setLocale(targetLocale);

        const [sourceData, targetData] = await Promise.all([
          sourceLoader.pull(),
          targetLoader.pull(),
        ]);
        const processableData = createProcessableData(sourceData, targetData);

        const processedData = await localizationEngine.process({
          sourceData,
          targetData,
          processableData,
        });

        await targetLoader.push(processedData);
      }
    }
  }
})();
