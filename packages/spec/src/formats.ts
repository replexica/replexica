import Z from 'zod';

export const bucketTypes = ['i18n', 'markdown'] as const;

export const bucketTypeSchema = Z.enum(bucketTypes);
