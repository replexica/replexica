import Z from 'zod';  
import { bucketTypeSchema } from '@replexica/spec';
import { composeLoaders } from './_utils';
import createJsonLoader from './json';
import createFlatLoader from './flat';
import createTextFileLoader from './text-file';
import createYamlLoader from './yaml';
import createRootKeyLoader from './root-key';
import createFlutterLoader from './flutter';
import { ILoader } from './_types';
import createAndroidLoader from './android';
import createCsvLoader from './csv';
import createHtmlLoader from './html';
import createMarkdownLoader from './markdown';
import createPropertiesLoader from './properties';
import createXcodeStringsLoader from './xcode-strings';
import createXcodeStringsdictLoader from './xcode-stringsdict';
import createXcodeXcstringsLoader from './xcode-xcstrings';
import createPrettierLoader from './prettier';

export default function createBucketLoader(
  bucketType: Z.infer<typeof bucketTypeSchema>,
  bucketPathPattern: string,
): ILoader<void, Record<string, string>> {
  switch (bucketType) {
    default: throw new Error(`Unsupported bucket type: ${bucketType}`);
    case 'android': return composeLoaders(
      createTextFileLoader(bucketPathPattern),
      createAndroidLoader(),
      createFlatLoader(),
    );
    case 'csv': return composeLoaders(
      createTextFileLoader(bucketPathPattern),
      createCsvLoader(),
      createFlatLoader(),
    );
    case 'html': return composeLoaders(
      createTextFileLoader(bucketPathPattern),
      createPrettierLoader({ parser: 'html', alwaysFormat: true }),
      createHtmlLoader(),
    );
    case 'json': return composeLoaders(
      createTextFileLoader(bucketPathPattern),
      createPrettierLoader({ parser: 'json' }),
      createJsonLoader(),
      createFlatLoader(),
    );
    case 'markdown': return composeLoaders(
      createTextFileLoader(bucketPathPattern),
      createPrettierLoader({ parser: 'markdown' }),
      createMarkdownLoader(),
    );
    case 'properties': return composeLoaders(
      createTextFileLoader(bucketPathPattern),
      createPropertiesLoader(),
    );
    case 'xcode-strings': return composeLoaders(
      createTextFileLoader(bucketPathPattern),
      createXcodeStringsLoader(),
    );
    case 'xcode-stringsdict': return composeLoaders(
      createTextFileLoader(bucketPathPattern),
      createXcodeStringsdictLoader(),
      createFlatLoader(),
    );
    case 'xcode-xcstrings': return composeLoaders(
      createTextFileLoader(bucketPathPattern),
      createPrettierLoader({ parser: 'json' }),
      createJsonLoader(),
      createXcodeXcstringsLoader(),
      createFlatLoader(),
    );
    case 'yaml': return composeLoaders(
      createTextFileLoader(bucketPathPattern),
      createPrettierLoader({ parser: 'yaml' }),
      createYamlLoader(),
      createFlatLoader(),
    );
    case 'yaml-root-key': return composeLoaders(
      createTextFileLoader(bucketPathPattern),
      createPrettierLoader({ parser: 'yaml' }),
      createYamlLoader(),
      createRootKeyLoader(true),
      createFlatLoader(),
    );
    case 'flutter': return composeLoaders(
      createTextFileLoader(bucketPathPattern),
      createPrettierLoader({ parser: 'json' }),
      createJsonLoader(),
      createFlutterLoader(),
      createFlatLoader(),
    );
  }
}
