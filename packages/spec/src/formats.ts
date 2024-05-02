import Z from 'zod';

export const bucketTypes = ['replexica', 'json', 'markdown', 'yaml', 'xcode', 'yaml-root-key'] as const;

export const bucketTypeSchema = Z.enum(bucketTypes);
