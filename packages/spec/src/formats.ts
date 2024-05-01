import Z from 'zod';

export const contentTypes = ['json', 'markdown', 'yaml', 'xcode', 'yaml-root-key'] as const;

export const contentTypeSchema = Z.enum(contentTypes);
