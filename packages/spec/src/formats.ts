import Z from 'zod';

export const bucketTypes = [
  'compiler',
  'markdown',
  'json',
  'yaml',
  'yaml-root-key',
  'xcode-xcstrings',
  'xcode-strings',
  'xcode-stringsdict',
  'android',
  'properties',
] as const;

export const bucketTypeSchema = Z.enum(bucketTypes);
