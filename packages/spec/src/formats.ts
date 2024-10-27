import Z from 'zod';

export const bucketTypes = [
  'android',
  'csv',
  'flutter',
  'html',
  'json',
  'markdown',
  'xcode-strings',
  
  'compiler',
  'yaml',
  'yaml-root-key',
  'xcode-xcstrings',
  'xcode-stringsdict',
  'properties',
] as const;

export const bucketTypeSchema = Z.enum(bucketTypes);
