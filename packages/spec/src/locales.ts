import Z from 'zod';

const localeMap = {
  // Urdu (Pakistan)
  ur: ['ur-PK'],
  // Vietnamese (Vietnam)
  vi: ['vi-VN'],
  // Turkish (Turkey)
  tr: ['tr-TR'],
  // Tamil (India)
  ta: ['ta-IN'],
  // Serbian
  sr: [
    'sr-RS',      // Serbian (Latin)
    'sr-Latn-RS', // Serbian (Latin)
    'sr-Cyrl-RS', // Serbian (Cyrillic)
  ],
  // Hungarian (Hungary)
  hu: ['hu-HU'],
  // Hebrew (Israel)
  he: ['he-IL'],
  // Estonian (Estonia)
  et: ['et-EE'],
  // Greek (Greece)
  el: ['el-GR'],
  // Danish (Denmark)
  da: ['da-DK'],
  // Azerbaijani (Azerbaijan)
  az: ['az-AZ'],
  // Thai (Thailand)
  th: ['th-TH'],
  // Swedish (Sweden)
  sv: ['sv-SE'],
  // English
  en: [
    'en-US', // United States
    'en-GB', // United Kingdom
    'en-AU', // Australia
    'en-CA', // Canada
  ],
  // Spanish
  es: [
    'es-ES',  // Spain
    'es-419', // Latin America
    'es-MX',  // Mexico
    'es-AR',  // Argentina
  ],
  // French
  fr: [
    'fr-FR', // France
    'fr-CA', // Canada
    'fr-BE', // Belgium
  ],
  // Catalan (Spain)
  ca: ['ca-ES'],
  // Japanese (Japan)
  ja: ['ja-JP'],
  // German
  de: [
    'de-DE', // Germany
    'de-AT', // Austria
    'de-CH', // Switzerland
  ],
  // Portuguese
  pt: [
    'pt-PT', // Portugal
    'pt-BR', // Brazil
  ],
  // Italian
  it: [
    'it-IT', // Italy
    'it-CH', // Switzerland
  ],
  // Russian
  ru: [
    'ru-RU', // Russia
    'ru-BY', // Belarus
  ],
  // Ukrainian (Ukraine)
  uk: ['uk-UA'],
  // Hindi (India)
  hi: ['hi-IN'],
  // Chinese
  zh: [
    'zh-CN',     // Simplified Chinese (China)
    'zh-TW',     // Traditional Chinese (Taiwan)
    'zh-HK',     // Traditional Chinese (Hong Kong)
    'zh-Hans',   // Simplified Chinese
    'zh-Hant',   // Traditional Chinese
    'zh-Hant-HK',// Traditional Chinese (Hong Kong)
    'zh-Hant-TW',// Traditional Chinese (Taiwan)
    'zh-Hans-CN',// Simplified Chinese (China)
  ],
  // Korean (South Korea)
  ko: ['ko-KR'],
  // Arabic
  ar: [
    'ar-EG', // Egypt
    'ar-SA', // Saudi Arabia
    'ar-AE', // United Arab Emirates
    'ar-MA', // Morocco
  ],
  // Bulgarian (Bulgaria)
  bg: ['bg-BG'],
  // Czech (Czech Republic)
  cs: ['cs-CZ'],
  // Dutch
  nl: [
    'nl-NL', // Netherlands
    'nl-BE', // Belgium
  ],
  // Polish (Poland)
  pl: ['pl-PL'],
  // Indonesian (Indonesia)
  id: ['id-ID'],
  // Malay (Malaysia)
  ms: ['ms-MY'],
  // Finnish (Finland)
  fi: ['fi-FI'],
  // Basque (Spain)
  eu: ['eu-ES'],
  // Croatian (Croatia)
  hr: ['hr-HR'],
  // Hebrew (Israel) - alternative code
  iw: ['iw-IL'],
  // Khmer (Cambodia)
  km: ['km-KH'],
  // Latvian (Latvia)
  lv: ['lv-LV'],
  // Lithuanian (Lithuania)
  lt: ['lt-LT'],
  // Norwegian (Norway)
  no: ['no-NO'],
  // Romanian (Romania)
  ro: ['ro-RO'],
  // Slovak (Slovakia)
  sk: ['sk-SK'],
  // Swahili
  sw: [
    'sw-TZ', // Tanzania
    'sw-KE', // Kenya
  ],
  // Persian (Iran)
  fa: ['fa-IR'],
  // Filipino (Philippines)
  fil: ['fil-PH'],
  // Punjabi
  pa: [
    'pa-IN', // India
    'pa-PK', // Pakistan
  ],
  // Bengali
  bn: [
    'bn-BD', // Bangladesh
    'bn-IN', // India
  ],
  // Irish (Ireland)
  ga: ['ga-IE'],
  // Maltese (Malta)
  mt: ['mt-MT'],
  // Slovenian (Slovenia)
  sl: ['sl-SI'],
  // Albanian (Albania)
  sq: ['sq-AL'],
  // Bavarian (Germany)
  bar: ['bar-DE'],
  // Neapolitan (Italy)
  nap: ['nap-IT'],
  // Afrikaans (South Africa)
  af: ['af-ZA'],
  // Somali (Somalia)
  so: ['so-SO'],
  // Tigrinya (Ethiopia)
  ti: ['ti-ET'],
  // Standard Moroccan Tamazight (Morocco)
  zgh: ['zgh-MA'],
  // Tagalog (Philippines)
  tl: ['tl-PH'],
  // Telugu (India)
  te: ['te-IN'],
} as const;

export type LocaleCodeShort = keyof typeof localeMap;
export type LocaleCodeFull = typeof localeMap[LocaleCodeShort][number];
export type LocaleCode = LocaleCodeShort | LocaleCodeFull;

export const localeCodesShort = Object.keys(localeMap) as LocaleCodeShort[];
export const localeCodesFull = Object.values(localeMap).flat() as LocaleCodeFull[];
export const localeCodesFullUnderscore = localeCodesFull.map(value => value.replace('-', '_'));
export const localeCodes = [...localeCodesShort, ...localeCodesFull, ...localeCodesFullUnderscore] as LocaleCode[];

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
