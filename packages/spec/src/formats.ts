import Z from 'zod';

export const bucketTypes = [
  'compiler',
  'markdown',
  'json',
  'yaml',
  'yaml-root-key',
  'xcode',
] as const;

export const bucketTypeSchema = Z.enum(bucketTypes);
