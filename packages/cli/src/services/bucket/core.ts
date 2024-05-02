import _ from 'lodash';
import { ReplexicaBucketProcessor } from './replexica.js';
import { bucketTypeSchema } from '@replexica/spec';
import { JsonBucketProcessor } from './json.js';
import { createId } from '@paralleldrive/cuid2';
import { YamlBucketProcessor } from './yaml.js';
import { YamlRootKeyBucketProcessor } from './yaml-root-key.js';
import { XcodeBucketProcessor } from './xcode.js';

// Bucket processor

export type BucketPayload = {
  data: Record<string, any>;
  meta: any;
};

export type BucketTranslatorFn = {
  (sourceLocale: string, targetLocale: string, payload: BucketPayload): Promise<BucketPayload>;
}

export interface IBucketProcessor {
  load(locale: string): Promise<BucketPayload>;
  translate(payload: BucketPayload, sourceLocale: string, targetLocale: string): Promise<BucketPayload>;
  save(locale: string, payload: BucketPayload): Promise<BucketPayload>;
}

export function createBucketProcessor(
  bucketType: typeof bucketTypeSchema._type, 
  bucketPath: string, 
  translator: BucketTranslatorFn,
): IBucketProcessor {
  switch (bucketType) {
    default: throw new Error(`Unknown bucket type: ${bucketType}`);
    case 'replexica': return new ReplexicaBucketProcessor(bucketPath, translator);
    case 'json': return new JsonBucketProcessor(bucketPath, translator);
    case 'yaml': return new YamlBucketProcessor(bucketPath, translator);
    case 'yaml-root-key': return new YamlRootKeyBucketProcessor(bucketPath, translator);
    case 'xcode': return new XcodeBucketProcessor(bucketPath, translator);
  }
}


// Translator


export type CreateTranslatorOptions = {
  apiUrl: string;
  apiKey: string;
  skipCache: boolean;
  cacheOnly: boolean;
};

export function createTranslator(options: CreateTranslatorOptions): BucketTranslatorFn {
  return async (sourceLocale, targetLocale, payload) => {
    const workflowId = createId();
    const res = await fetch(`${options.apiUrl}/i18n`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${options.apiKey}`,
      },
      body: JSON.stringify({
        params: {
          workflowId,
          cacheOnly: options.cacheOnly,
          skipCache: options.skipCache,
        },
        locale: {
          source: sourceLocale,
          target: targetLocale,
        },
        meta: payload.meta,
        data: payload.data,
      }, null, 2),
    });

    if (!res.ok) {
      if (res.status === 400) {
        throw new Error(`Invalid request: ${res.statusText}`);
      } else {
        const errorText = await res.text();
        throw new Error(errorText);
      }
    }

    const result = await res.json();
    return result;
  };
}
