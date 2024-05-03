import Z from 'zod';

const coreLocales = [
  'en', // English
  'es', // Spanish
  'fr', // French
  'ca', // Catalan
] as const;

// Source
export const sourceLocales = [
  ...coreLocales,
  'cs', // Czech
] as const;

export const sourceLocaleSchema = Z.enum(sourceLocales);

// Target
export const targetLocales = [
  ...coreLocales,
  'shyriiwook', // Wookiee language (Star Wars)
] as const;

export const targetLocaleSchema = Z.enum(targetLocales);
