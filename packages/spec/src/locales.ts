import Z from 'zod';

const coreLocales = [
  'en', // English
  'es', // Spanish
  'fr', // French
  'ca', // Catalan
  'ja', // Japanese
  'de', // German
  'pt', // Portuguese
  'it', // Italian
  'ru', // Russian
  'uk', // Ukrainian
  'hi', // Hindi
  'zh', // Mandarin
  'ko', // Korean
  'tr', // Turkish 
  'ar', // Arabic

] as const;

// Source
export const sourceLocales = [
  ...coreLocales,
  'cs', // Czech
  'yue', // Cantonese
  'pl', // Polish
  'sk', // Slovak
  'th', // Thai
] as const;

export const sourceLocaleSchema = Z.enum(sourceLocales);

// Target
export const targetLocales = [
  ...coreLocales,
  'shyriiwook', // Wookiee language (Star Wars)
] as const;

export const targetLocaleSchema = Z.enum(targetLocales);
