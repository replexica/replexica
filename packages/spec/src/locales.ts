import Z from 'zod';

const coreLocales = ['en', 'es'] as const;

// Source
export const sourceLocales = [...coreLocales] as const;

export const sourceLocaleSchema = Z.enum(sourceLocales);

// Target
export const targetLocales = [...coreLocales] as const;

export const targetLocaleSchema = Z.enum(targetLocales);
