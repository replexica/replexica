import Z from 'zod';

export const bucketTypes = [
  'android',
  'csv',
  'flutter',
  'html',
  'json',
  'markdown',
  
  'compiler',
  'yaml',
  'yaml-root-key',
  'xcode-xcstrings',
  'xcode-strings',
  'xcode-stringsdict',
  'properties',
] as const;

export const bucketTypeSchema = Z.enum(bucketTypes);
