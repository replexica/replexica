import Z from 'zod';

const localeMap = {
  ur: ['ur-PK'],
  vi: ['vi-VN'],
  tr: ['tr-TR'],
  ta: ['ta-IN'],
  sr: ['sr-RS', 'sr-Latn-RS', 'sr-Cyrl-RS'],
  hu: ['hu-HU'],
  he: ['he-IL'],
  et: ['et-EE'],
  el: ['el-GR'],
  da: ['da-DK'],
  az: ['az-AZ'],
  th: ['th-TH'],
  sv: ['sv-SE'],
  en: ['en-US', 'en-GB', 'en-AU', 'en-CA'],
  es: ['es-ES', 'es-419', 'es-MX', 'es-AR'],
  fr: ['fr-FR', 'fr-CA', 'fr-BE'],
  ca: ['ca-ES'],
  ja: ['ja-JP'],
  de: ['de-DE', 'de-AT', 'de-CH'],
  pt: ['pt-PT', 'pt-BR'],
  it: ['it-IT', 'it-CH'],
  ru: ['ru-RU', 'ru-BY'],
  uk: ['uk-UA'],
  hi: ['hi-IN'],
  zh: ['zh-CN', 'zh-TW', 'zh-HK', 'zh-Hans', 'zh-Hant', 'zh-Hant-HK', 'zh-Hant-TW', 'zh-Hans-CN'],
  ko: ['ko-KR'],
  ar: ['ar-EG', 'ar-SA', 'ar-AE', 'ar-MA'],
  bg: ['bg-BG'],
  cs: ['cs-CZ'],
  nl: ['nl-NL', 'nl-BE'],
  pl: ['pl-PL'],
  id: ['id-ID'],
  ms: ['ms-MY'],
  fi: ['fi-FI'],
  eu: ['eu-ES'],
  hr: ['hr-HR'],
  iw: ['iw-IL'],
  km: ['km-KH'],
  lv: ['lv-LV'],
  lt: ['lt-LT'],
  no: ['no-NO'],
  ro: ['ro-RO'],
  sk: ['sk-SK'],
  sw: ['sw-TZ', 'sw-KE'],
  fa: ['fa-IR'],
  fil: ['fil-PH'],
  pa: ['pa-IN', 'pa-PK'],
  bn: ['bn-BD', 'bn-IN'],
} as const;

export type LocaleCodeShort = keyof typeof localeMap;
export type LocaleCodeFull = typeof localeMap[LocaleCodeShort][number];
export type LocaleCode = LocaleCodeShort | LocaleCodeFull;

export const localeCodesShort = Object.keys(localeMap) as LocaleCodeShort[];
export const localeCodesFull = Object.values(localeMap).flat() as LocaleCodeFull[];
export const localeCodes = [...localeCodesShort, ...localeCodesFull] as LocaleCode[];

export const localeCodeSchema = Z
  .string()
  .refine(
    (value) => localeCodes.includes(value as any),
    { message: 'Invalid locale code' },
  );

export const resolveLocaleCode = (value: LocaleCode): LocaleCodeFull => {
  const existingFullLocaleCode = Object.values(localeMap).flat().includes(value as any);
  if (existingFullLocaleCode) { return value as LocaleCodeFull; }

  const existingShortLocaleCode = Object.keys(localeMap).includes(value);
  if (existingShortLocaleCode) {
    const correspondingFullLocales = localeMap[value as LocaleCodeShort];
    const fallbackFullLocale = correspondingFullLocales[0];
    return fallbackFullLocale;
  }

  throw new Error(`Invalid locale code: ${value}`);
};
