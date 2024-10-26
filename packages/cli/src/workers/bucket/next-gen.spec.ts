import fs from 'fs/promises';
import { flatten, unflatten } from 'flat';
import { describe, it, expect } from 'vitest';

// Base
export interface ILoader<I, O> {
  pull(rawData: I, locale: string): Promise<O>;
  push(data: O, locale: string, rawData?: I): Promise<I>;

  onStart?(): Promise<void>;
  onProgress?(current: number, total: number): Promise<void>;
  onEnd?(): Promise<void>;
}

export function composeLoaders<O>(...loaders: ILoader<any, any>[]): ILoader<void, O> {
  return {
    pull: async (rawData: any, locale: string) => {
      let result = rawData;
      for (const loader of loaders) {
        result = await loader.pull(result, locale);
      }
      return result;
    },
    push: async (data: any, locale: string) => {
      let result = data;
      for (const loader of loaders.reverse()) {
        result = await loader.push(result, locale);
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



export function createStatefulLoader<I, O>(loader: ILoader<I, O>): ILoader<I, O> {
  return {
    ...loader,
    async pull(rawData, locale) {
      this.rawData = rawData;

      return loader.pull(rawData, locale);
    },
    async push(data, locale) {
      if (!this.rawData) { throw new Error('Cannot push data before pulling'); }

      return loader.push(data, locale, this.rawData);
    }
  } as ILoader<I, O>;
}

// TODO: record locale on loader creation, and forbid it from being changed between pull and push

// Mock
export function createPassThroughLoader(state: any): ILoader<void, string> {
  return {
    pull: async () => state.data,
    push: async (data) => {
      state.data = data;
    },
  };
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
  return {
    pull: async (rawData, locale) => {
      const flattenedData = flatten(rawData) as Record<string, string>;
      return flattenedData;
    },
    push: async (data, locale) => {
      const unflattenedData = unflatten(data) as Record<string, any>;
      return unflattenedData;
    },
  };
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
  return {
    pull: async (rawData, locale) => {
      const data = JSON.parse(rawData);
      return data;
    },
    push: async (data, locale) => {
      const serializedData = JSON.stringify(data);
      return serializedData;
    },
  };
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
  return createStatefulLoader({
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
  return {
    pull: async (rawData, locale) => {
      const finalPath = pathPattern.replace('[locale]', locale);
      const data = await fs.readFile(finalPath, 'utf-8');
      return data;
    },
    push: async (data, locale) => {
      const finalPath = pathPattern.replace('[locale]', locale);
      await fs.writeFile(finalPath, data);
    },
  };
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
    );

    const data = await loader.pull(undefined, 'en');

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
    );

    const data = await loader.pull(undefined, 'en');

    expect(data).toEqual({
      'messages.greeting': 'Hello',
      'messages.farewell': 'Goodbye',
    });
  });

  it('should push data with root key', async () => {
    const mockState = {
      data: JSON.stringify(_mockData),
    }
    const loader = composeLoaders<Record<string, any>>(
      createPassThroughLoader(mockState),
      createJsonLoader(),
      createRootKeyLoader(),
      createFlatLoader(),
    );

    await loader.onStart?.();
    await loader.pull(undefined, 'en');
    await loader.onProgress?.(0, 1);
    const processedData = {
      'messages.greeting': 'Bonjour',
      'messages.farewell': 'Au revoir',
    };
    await loader.onProgress?.(1, 1);
    await loader.push(processedData, 'fr');
    await loader.onEnd?.();

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
