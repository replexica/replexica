import { allLocalesSchema } from "@replexica/spec";
import Z from 'zod';
import path from 'path';

export type BucketPathResolver = {
  (locale: Z.infer<typeof allLocalesSchema>, bucketPath: string): Promise<string>;
}

export async function plainPathResolver(locale: Z.infer<typeof allLocalesSchema>, bucketPath: string) {
  return path.join(process.cwd(), bucketPath);
}

export async function patternPathResolver(locale: Z.infer<typeof allLocalesSchema>, bucketPath: string) {
  if (!bucketPath.includes('[locale]')) {
    throw new Error('Bucket path must contain [locale] placeholder');
  }

  const localePath = bucketPath.replace('[locale]', locale);
  const result = plainPathResolver(locale, localePath);

  return result;
}

export async function concreteNamePathResolveR(locale: Z.infer<typeof allLocalesSchema>, bucketPath: string) {
  const result = await plainPathResolver(locale, bucketPath);
  
  const filename = 'Localizable.xcstrings';
  if (!result.endsWith(filename)) {
    throw new Error(`Filename must be ${filename}`);
  }

  return result;
}