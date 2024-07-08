import { allLocalesSchema, bucketTypeSchema } from '@replexica/spec';
import Z from 'zod';
import { createFileLoader, IBucketLoader } from './loader';
import { createJsonParser, createMarkdownParser, createXcodeParser, createYamlParser, IBucketParser } from './parser';
import { BucketPathResolver, patternPathResolver, plainPathResolver } from './path-resolver';

export function createBucketProcessor(bucketType: Z.infer<typeof bucketTypeSchema>, bucketPath: string) {
  switch (bucketType) {
    default:
      throw new Error(`Unsupported bucket type: ${bucketType}`);
    case 'json':
      return composeBucketProcessor(bucketPath, {
        storage: createFileLoader(),
        parser: createJsonParser(),
        pathResolver: patternPathResolver,
      })
    case 'yaml':
      return composeBucketProcessor(bucketPath, {
        storage: createFileLoader(),
        parser: createYamlParser({ rootKey: false }),
        pathResolver: patternPathResolver,
      });
    case 'yaml-root-key':
      return composeBucketProcessor(bucketPath, {
        storage: createFileLoader(),
        parser: createYamlParser({ rootKey: true }),
        pathResolver: patternPathResolver,
      });
    case 'markdown':
      return composeBucketProcessor(bucketPath, {
        storage: createFileLoader(),
        parser: createMarkdownParser(),
        pathResolver: patternPathResolver,
      });
    case 'xcode':
      return composeBucketProcessor(bucketPath, {
        storage: createFileLoader(),
        parser: createXcodeParser(),
        pathResolver: plainPathResolver,
      });
    case 'compiler':
      return composeBucketProcessor(`node_modules/@replexica/.cache/[locale].json`, {
        storage: createFileLoader(),
        parser: createJsonParser(),
        pathResolver: patternPathResolver,
      });
  }
}

// Helpers

type BucketProcessorParams = {
  storage: IBucketLoader;
  parser: IBucketParser;
  pathResolver: BucketPathResolver;
};

function composeBucketProcessor(bucketPath: string, params: BucketProcessorParams) {
  return {
    async load(locale: Z.infer<typeof allLocalesSchema>) {
      const filePath = await params.pathResolver(locale, bucketPath);
      const content = await params.storage.load(locale, filePath);
      if (!content) { return {}; }

      const payload = await params.parser.deserialize(locale, content);
      return payload;
    },
    async save(locale: Z.infer<typeof allLocalesSchema>, payload: Record<string, string>) {
      const serialized = await params.parser.serialize(locale, payload);

      const filePath = await params.pathResolver(locale, bucketPath);
      await params.storage.save(locale, filePath, serialized);
    },
  };
}
