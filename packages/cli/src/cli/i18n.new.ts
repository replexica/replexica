import { bucketTypeSchema, I18nConfig, localeCodeSchema } from '@replexica/spec';
import { Command } from 'commander';
import Z from 'zod';
import _ from 'lodash';
import { getConfig } from '../workers/config';
import { getSettings } from '../workers/settings';
import { ReplexicaCLIError } from '../utils/errors';
import path from 'path';
import * as glob from 'glob';
import createBucketLoader from '../loaders';

export default new Command()
  .command('i18n2')
  .description('Run AI localization engine')
  .helpOption('-h, --help', 'Show help')
  .option('--locale <locale>', 'Locale to process')
  .option('--bucket <bucket>', 'Bucket to process')
  .option('--frozen', `Don't update the translations and fail if an update is needed`)
  .option('--force', 'Ignore lockfile and process all keys')
  .option('--api-key <api-key>', 'Explicitly set the API key to use')
  .action(async function (options) {
    const flags = parseFlags(options);
    const i18nConfig = getConfig();
    const settings = getSettings(flags.apiKey);

    validateParams(i18nConfig, flags);

    const buckets = getBuckets(i18nConfig!, flags);
    const targetLocales = getTargetLocales(i18nConfig!, flags);

    for (const bucket of buckets) {
      for (const pathPattern of bucket.pathPatterns) {
        const bucketLoader = createBucketLoader(bucket.type, pathPattern);
        bucketLoader.setDefaultLocale(i18nConfig!.locale.source);

        const sourceData = await bucketLoader.pull(i18nConfig!.locale.source);

        for (const targetLocale of targetLocales) {
          const targetData = await bucketLoader.pull(targetLocale);

          const processableData = calculateDataDelta({ sourceData, targetData });

          const localizationEngine = createLocalizationEngineConnection({
            apiKey: settings.auth.apiKey,
            apiUrl: settings.auth.apiUrl,
          });
          const processedTargetData = await localizationEngine.process({
            sourceData,
            targetData,
            processableData,
          });

          await bucketLoader.push(targetLocale, processedTargetData);
        }
      }
    }
  });

function calculateDataDelta(args: {
  sourceData: Record<string, any>;
  targetData: Record<string, any>;
}) {
  // Calculate missing keys
  const newKeys = _.difference(Object.keys(args.sourceData), Object.keys(args.targetData));
  // Calculate updated keys
  const updatedKeys: string[] = []; // TODO
  // Calculate passthrough keys, that should be left unchanged
  const passthroughKeys = Object.entries(args.sourceData)
    .filter(([_, value]) => {
      const stringValue = String(value);
      return [
        (v: string) => !isNaN(Date.parse(v)),
        (v: string) => !isNaN(Number(v)),
        (v: string) => ['true', 'false'].includes(v.toLowerCase())
      ].some(fn => fn(stringValue));
    })
    .map(([key, _]) => key);

  // Calculate delta payload
  const result = _.chain(args.sourceData)
    .pickBy((value, key) => newKeys.includes(key) || updatedKeys.includes(key))
    .omitBy((value, key) => passthroughKeys.includes(key))
    .value() as Record<string, any>;

  return result;
}

function createLocalizationEngineConnection(args: {
  apiKey: string;
  apiUrl: string;
}) {
  return {
    process: async (args: {
      sourceData: Record<string, any>;
      targetData: Record<string, any>;
      processableData: Record<string, any>;
    }) => {
      // TODO
      return args.processableData;
    },
  };
}

function getTargetLocales(i18nConfig: I18nConfig, flags: ReturnType<typeof parseFlags>) {
  let result = i18nConfig.locale.targets;
  if (flags.locale) {
    result = result.filter((locale) => locale === flags.locale);
  }
  return result;
}

function getBuckets(i18nConfig: I18nConfig, flags: ReturnType<typeof parseFlags>) {
  let result = Object
    .entries(i18nConfig.buckets)
    .map(([bucketType, bucketEntry]) => ({
      type: bucketType as Z.infer<typeof bucketTypeSchema>,
      pathPatterns: extractPathPatterns(i18nConfig.locale.source, bucketEntry.include, bucketEntry?.exclude),
    }));

  if (flags.bucket) {
    result = result.filter((bucket) => bucket.type === flags.bucket);
  }

  return result;
}

function parseFlags(options: any) {
  return Z.object({
    apiKey: Z.string().optional(),
    locale: localeCodeSchema.optional(),
    bucket: bucketTypeSchema.optional(),
    force: Z.boolean().optional(),
    frozen: Z.boolean().optional(),
  }).parse(options);
}

function validateParams(i18nConfig: I18nConfig | null, flags: ReturnType<typeof parseFlags>) {
  if (!i18nConfig) {
    throw new ReplexicaCLIError({
      message: 'i18n.json not found. Please run `replexica init` to initialize the project.',
      docUrl: "i18nNotFound"
    });
  } else if (!i18nConfig.buckets || !Object.keys(i18nConfig.buckets).length) {
    throw new ReplexicaCLIError({
      message: "No buckets found in i18n.json. Please add at least one bucket containing i18n content.",
      docUrl: "bucketNotFound"
    });
  } else if (flags.locale && !i18nConfig.locale.targets.includes(flags.locale)) {
    throw new ReplexicaCLIError({
      message: `Source locale ${i18nConfig.locale.source} does not exist in i18n.json locale.targets. Please add it to the list and try again.`,
      docUrl: "localeTargetNotFound"
    });
  } else if (flags.bucket && !i18nConfig.buckets[flags.bucket as keyof typeof i18nConfig.buckets]) {
    throw new ReplexicaCLIError({
      message: `Bucket ${flags.bucket} does not exist in i18n.json. Please add it to the list and try again.`,
      docUrl: "bucketNotFound"
    });
  }
}

function extractPathPatterns(
  sourceLocale: string,
  include: string[],
  exclude?: string[],
) {
  const includedPatterns = include.flatMap((pattern) => expandPlaceholderedGlob(pattern, sourceLocale));
  const excludedPatterns = exclude?.flatMap((pattern) => expandPlaceholderedGlob(pattern, sourceLocale));
  const result = _.difference(includedPatterns, excludedPatterns ?? []);
  return result;
}

// Path expansion
function expandPlaceholderedGlob(_pathPattern: string, sourceLocale: string): string[] {
  // Throw if pathPattern is an absolute path
  const absolutePathPattern = path.resolve(_pathPattern);
  const pathPattern = path.relative(process.cwd(), absolutePathPattern);
  // Throw if pathPattern points outside the current working directory
  if (path.relative(process.cwd(), pathPattern).startsWith('..')) {
    throw new ReplexicaCLIError({
      message: `Invalid path pattern: ${pathPattern}. Path pattern must be within the current working directory.`,
      docUrl: "invalidPathPattern"
    });
  }
  // Throw error if pathPattern contains "**" – we don't support recursive path patterns
  if (pathPattern.includes('**')) {
    throw new ReplexicaCLIError({
      message: `Invalid path pattern: ${pathPattern}. Recursive path patterns are not supported.`,
      docUrl: 'invalidPathPattern'
    });
  }
  // Throw error if pathPattern contains "[locale]" several times
  if (pathPattern.split('[locale]').length > 2) {
    throw new ReplexicaCLIError({
      message: `Invalid path pattern: ${pathPattern}. Path pattern must contain at most one "[locale]" placeholder.`,
      docUrl: "invalidPathPattern"
    });
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
