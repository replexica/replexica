import _ from 'lodash';
import Z from 'zod';
import { ReplexicaBucketProcessor } from './replexica.js';
import { contentTypes, contentTypeSchema } from '@replexica/spec';
import { JsonBucketProcessor } from './json.js';

export const bucketTypes = [...contentTypes, 'replexica'] as const;

export const bucketTypeSchema = Z.union([Z.literal('replexica'), contentTypeSchema]);

export function createBucketProcessor(
  bucketType: typeof bucketTypeSchema._type, 
  bucketPath: string, 
  translator: BucketTranslatorFn,
): IBucketProcessor {
  switch (bucketType) {
    default: throw new Error(`Unknown bucket type: ${bucketType}`);
    case 'replexica': return new ReplexicaBucketProcessor(bucketPath, translator);
    case 'json': return new JsonBucketProcessor(bucketPath, translator);
  }
}

export type BucketPayload = {
  data: Record<string, any>;
  meta: any;
};

export type BucketTranslatorFn = {
  (sourceLocale: string, targetLocale: string, data: BucketPayload['data'], meta: BucketPayload['meta']): Promise<BucketPayload['data']>;
}

export interface IBucketProcessor {
  load(locale: string): Promise<BucketPayload>;
  translate(payload: BucketPayload, sourceLocale: string, targetLocale: string): Promise<BucketPayload['data']>;
  save(locale: string, data: BucketPayload['data']): Promise<void>;
}
