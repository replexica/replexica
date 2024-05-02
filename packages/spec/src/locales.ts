import Z from 'zod';

// Source
export const sourceLocales = ['en'] as const;

export const sourceLocaleSchema = Z.enum(sourceLocales);

// Target
export const targetLocales = ['es'] as const;

export const targetLocaleSchema = Z.enum(targetLocales);
