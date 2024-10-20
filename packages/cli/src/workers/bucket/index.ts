import { bucketTypeSchema } from '@replexica/spec';
import Z from 'zod';
import path from 'path';
import * as glob from 'glob';

import { composeLoaders } from './_base';
import { textLoader } from './text-file';
import { jsonLoader } from './json';
import { flatLoader } from './flat';
import { yamlLoader } from './yaml';
import { rootKeyLoader } from './root-key';
import { markdownLoader } from './markdown';
import { xcodeXcstringsLoader } from './xcode-xcstrings';
import { androidLoader } from './android';
import { propertiesLoader } from './properties';
import { xcodeStringsLoader } from './xcode-strings';
import { xcodeStringsdictLoader } from './xcode-stringsdict';

// Path expansion
export function expandPlaceholderedGlob(pathPattern: string, sourceLocale: string): string[] {
  // Throw if pathPattern is an absolute path
  if (path.isAbsolute(pathPattern)) {
    throw new Error(`Invalid path pattern: ${pathPattern}. Path pattern must be relative.`);
  }
  // Throw if pathPattern points outside the current working directory
  if (path.relative(process.cwd(), pathPattern).startsWith('..')) {
    throw new Error(`Invalid path pattern: ${pathPattern}. Path pattern must be within the current working directory.`);
  }
  // Throw error if pathPattern contains "**" – we don't support recursive path patterns
  if (pathPattern.includes('**')) {
    throw new Error(`Invalid path pattern: ${pathPattern}. Recursive path patterns are not supported.`);
  }
  // Throw error if pathPattern contains "[locale]" several times
  if (pathPattern.split('[locale]').length > 2) {
    throw new Error(`Invalid path pattern: ${pathPattern}. Path pattern must contain at most one "[locale]" placeholder.`);
  }
  // Break down path pattern into parts
  const pathPatternChunks = pathPattern.split(path.sep);
  // Find the index of the segment containing "[locale]"
  const localeSegmentIndex = pathPatternChunks.findIndex((segment) => segment.includes('[locale]'));
  // Find the position of the "[locale]" placeholder within the segment
  const localePlaceholderIndex = pathPatternChunks[localeSegmentIndex]?.indexOf('[locale]') ?? -1;
  // substitute [locale] in pathPattern with sourceLocale
  const sourcePathPattern = pathPattern.replace(/\[locale\]/g, sourceLocale);
  // get all files that match the sourcePathPattern
  const sourcePaths = glob
    .sync(sourcePathPattern, { follow: true, withFileTypes: true })
    .filter((file) => file.isFile() || file.isSymbolicLink())
    .map((file) => file.fullpath())
    .map((fullpath) => path.relative(process.cwd(), fullpath));
  // transform each source file path back to [locale] placeholder paths
  const placeholderedPaths = sourcePaths.map((sourcePath) => {
    const sourcePathChunks = sourcePath.split(path.sep);
    if (localeSegmentIndex >= 0 && localePlaceholderIndex >= 0) {
      const placeholderedPathChunk = sourcePathChunks[localeSegmentIndex];
      const placeholderedSegment =
        placeholderedPathChunk.substring(0, localePlaceholderIndex)
        + '[locale]'
        + placeholderedPathChunk.substring(localePlaceholderIndex + sourceLocale.length)
      ;
      sourcePathChunks[localeSegmentIndex] = placeholderedSegment;
    }
    const placeholderedPath = sourcePathChunks.join(path.sep);
    return placeholderedPath;
  });
  // return the placeholdered paths
  return placeholderedPaths;
}

export type CreateBucketLoaderParams = {
  bucketType: Z.infer<typeof bucketTypeSchema>;
  placeholderedPath: string;
  locale: string;
};
export function createBucketLoader(params: CreateBucketLoaderParams) {
  const filepath = params.placeholderedPath.replace(/\[locale\]/g, params.locale);
  switch (params.bucketType) {
    default:
      throw new Error(`Unsupported bucket type: ${params.bucketType}`);
    case 'markdown':
      return composeLoaders<string, Record<string, string>>(
        textLoader(filepath),
        markdownLoader(),
        flatLoader(),
      );
    case 'json':
      return composeLoaders<string, Record<string, string>>(
        textLoader(filepath),
        jsonLoader(),
        flatLoader(),
      );
    case 'yaml':
      return composeLoaders<string, Record<string, string>>(
        textLoader(filepath),
        yamlLoader(),
        flatLoader(),
      );
    case 'xcode-xcstrings':
      return composeLoaders<string, Record<string, string>>(
        xcodeXcstringsLoader(
          params.locale,
          composeLoaders<void, Record<string, any>>(
            textLoader(filepath),
            jsonLoader(),
          ),
        ),
        flatLoader(),
      );
    
    case 'xcode-strings':
      return composeLoaders<string, Record<string, string>>(
        textLoader(filepath),
        xcodeStringsLoader(),
        flatLoader(),
      );
    
    case 'xcode-stringsdict':
      return composeLoaders<string, Record<string, string>>(
        textLoader(filepath),
        xcodeStringsdictLoader(),
        flatLoader(),
      );

    case 'yaml-root-key':
      return composeLoaders<string, Record<string, string>>(
        rootKeyLoader(
          params.locale,
          composeLoaders(
            textLoader(filepath),
            yamlLoader(),
          ),
        ),
        flatLoader(),
      );
    case 'android':
      return composeLoaders<string, Record<string, string>>(
        textLoader(filepath),
        androidLoader(),
        flatLoader(),
      );
    case 'compiler':
      return composeLoaders<string, Record<string, string>>(
        textLoader('node_modules/@replexica/.cache/[locale].json'),
        jsonLoader(),
        flatLoader(),
      );
    case 'properties':
      return composeLoaders<string, Record<string, string>>(
        textLoader(filepath),
        propertiesLoader(),
        flatLoader(),
      );
  }
}
