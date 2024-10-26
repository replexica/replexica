import { describe, it, expect } from 'vitest';
import { composeLoaders } from './_utils';
import createPassThroughLoader from './passthrough';
import createJsonLoader from './json';
import createFlatLoader from './flat';
import createRootKeyLoader from './root-key';

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

// (async function main() {
//   const localizationEngine = createLocalizationEngine();
//   const config = await loadConfig();
//   const buckets = await findBuckets();
//   for (const [bucketType, bucketPath] of Object.entries(buckets)) {
//     const pathPatterns = extractPathPatterns(bucketPath);
//     for (const bucketPathPattern of pathPatterns) {
//       const sourceLoader = createBucketLoader(bucketType, bucketPathPattern).setLocale(config.locale.source);
//       for (const targetLocale of config.locale.targets) {
//         const targetLoader = createBucketLoader(bucketType, bucketPathPattern).setLocale(targetLocale);

//         const [sourceData, targetData] = await Promise.all([
//           sourceLoader.pull(),
//           targetLoader.pull(),
//         ]);
//         const processableData = createProcessableData(sourceData, targetData);

//         const processedData = await localizationEngine.process({
//           sourceData,
//           targetData,
//           processableData,
//         });

//         await targetLoader.push(processedData);
//       }
//     }
//   }
// })();
