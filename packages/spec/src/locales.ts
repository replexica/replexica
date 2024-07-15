import Z from 'zod';

// Core locales
const coreFullLocales = [
    'en-US', // English (United States)
    'en-GB', // English (United Kingdom)
    'en-AU', // English (Australia)
    'en-CA', // English (Canada)

    'es-ES', // Spanish (Spain)
    'es-MX', // Spanish (Mexico)
    'es-AR', // Spanish (Argentina)

    'fr-FR', // French (France)
    'fr-CA', // French (Canada)
    'fr-BE', // French (Belgium)

    'de-DE', // German (Germany)
    'de-AT', // German (Austria)
    'de-CH', // German (Switzerland)

    'pt-PT', // Portuguese (Portugal)
    'pt-BR', // Portuguese (Brazil)
    
    'it-IT', // Italian (Italy)
    'it-CH', // Italian (Switzerland)

    'ru-RU', // Russian (Russia)
    'ru-BY', // Russian (Belarus)

    'zh-Hans-CN', // Simplified Chinese (China)
    'zh-Hant-TW', // Traditional Chinese (Taiwan)
    'zh-Hant-HK', // Traditional Chinese (Hong Kong)

    'ar-EG', // Arabic (Egypt)
    'ar-SA', // Arabic (Saudi Arabia)
    'ar-AE', // Arabic (United Arab Emirates)
    'ar-MA', // Arabic (Morocco)

    'nl-NL', // Dutch (Netherlands)
    'nl-BE', // Dutch (Belgium)

    'sv-SE', // Swedish (Sweden)

    'pl-PL', // Polish (Poland)

    'vi-VN', // Vietnamese (Vietnam)

    'id-ID', // Indonesian (Indonesia)

    'ms-MY', // Malay (Malaysia)

    'th-TH', // Thai (Thailand)

    'fi-FI', // Finnish (Finland)

    'ca-ES', // Catalan (Spain)
    'ja-JP', // Japanese (Japan)
    'uk-UA', // Ukrainian (Ukraine)
    'hi-IN', // Hindi (India)
    'ko-KR', // Korean (South Korea)
    'tr-TR', // Turkish (Turkey)
] as const;
const coreShortcutLocales = [
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
    'zh', // Simplified Chinese
    'zh-Hans', // Simplified Chinese
    'ko', // Korean
    'tr', // Turkish 
    'ar', // Arabic
    'nl', // Dutch
    'pl', // Polish
    'vi', // Vietnamese
    'id', // Indonesian
    'ms', // Malay
    'th', // Thai
    'fi', // Finnish
] as const;
const coreLocales = [
    ...coreFullLocales,
    ...coreShortcutLocales,
] as const;

// Source locales
const sourceOnlyFullLocales = [
    'cs-CZ', // Czech (Czech Republic)
    'zh-Hant-HK', // Traditional Chinese (Hong Kong)
    'sk-SK', // Slovak (Slovakia)
] as const;
const sourceOnlyShortcutLocales = [
    'cs', // Czech
    'zh-Hant', // Traditional Chinese
    'sk', // Slovak
] as const;
const sourceOnlyLocales = [
    ...sourceOnlyFullLocales,
    ...sourceOnlyShortcutLocales,
] as const;

const sourceFullLocales = [
    ...coreFullLocales,
    ...sourceOnlyFullLocales,
] as const;

const sourceShortcutLocales = [
    ...coreShortcutLocales,
    ...sourceOnlyShortcutLocales,
] as const;

export const sourceLocales = [
    ...coreLocales,
    ...sourceOnlyLocales,
] as const;



// Target locales
const targetOnlyFullLocales = [
    'shyriiwook', // Shyriiwook
] as const;
const targetOnlyShortcutLocales = [
] as const;
const targetOnlyLocales = [
    ...targetOnlyFullLocales,
    ...targetOnlyShortcutLocales,
] as const;

const targetFullLocales = [
    ...coreFullLocales,
    ...targetOnlyFullLocales,
] as const;


const targetShortcutLocales = [
    ...coreShortcutLocales,
    ...targetOnlyShortcutLocales,
] as const;
export const targetLocales = [
    ...coreLocales,
    ...targetOnlyLocales,
] as const;


// Locale resolution map

const coreLocaleResolutionMap: Record<typeof coreShortcutLocales[number], typeof coreFullLocales[number]> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    ca: 'ca-ES',
    ja: 'ja-JP',
    de: 'de-DE',
    pt: 'pt-PT',
    it: 'it-IT',
    ru: 'ru-RU',
    uk: 'uk-UA',
    hi: 'hi-IN',
    zh: 'zh-Hans-CN',
    'zh-Hans': 'zh-Hans-CN',
    ko: 'ko-KR',
    tr: 'tr-TR',
    ar: 'ar-EG',
    nl: 'nl-NL',
    pl: 'pl-PL',
    vi: 'vi-VN',
    id: 'id-ID',
    ms: 'ms-MY',
    th: 'th-TH',
    fi: 'fi-FI',
};

const sourceOnlyLocaleResolutionMap: Record<typeof sourceOnlyShortcutLocales[number], typeof sourceOnlyFullLocales[number]> = {
    cs: 'cs-CZ',
    'zh-Hant': 'zh-Hant-HK',
    sk: 'sk-SK',
};

const targetOnlyLocaleResolutionMap: Record<typeof targetOnlyShortcutLocales[number], typeof targetOnlyFullLocales[number]> = {
};

const sourceLocaleResolutionMap: Record<typeof sourceShortcutLocales[number], typeof sourceFullLocales[number]> = {
    ...coreLocaleResolutionMap,
    ...sourceOnlyLocaleResolutionMap,
};

const targetLocaleResolutionMap: Record<typeof targetShortcutLocales[number], typeof targetFullLocales[number]> = {
    ...coreLocaleResolutionMap,
    ...targetOnlyLocaleResolutionMap,
};

const localeResolutionMap: Record<typeof shortcutLocales[number], typeof fullLocales[number]> = {
    ...sourceLocaleResolutionMap,
    ...targetLocaleResolutionMap,
};

// Exports

// All locales

export const shortcutLocales = [
    ...coreShortcutLocales,
    ...sourceOnlyShortcutLocales,
    ...targetOnlyShortcutLocales,
] as const;

export const fullLocales = [
    ...coreFullLocales,
    ...sourceOnlyFullLocales,
    ...targetOnlyFullLocales,
] as const;

export const allLocales = [
    ...coreLocales,
    ...sourceOnlyLocales,
    ...targetOnlyLocales,
] as const;

// Schemas

export const sourceFullLocaleSchema = Z.enum(sourceFullLocales);
export const sourceLocaleSchema = Z.enum(sourceLocales);
export const targetFullLocaleSchema = Z.enum(targetFullLocales);
export const targetLocaleSchema = Z.enum(targetLocales);

export const allLocalesSchema = Z.enum(allLocales);

// Shortcut resolvers

export const resolveSourceLocale = (locale: typeof sourceLocales[number]): typeof sourceFullLocales[number] => {
    if (sourceFullLocales.includes(locale as typeof sourceFullLocales[number])) {
        return locale as typeof sourceFullLocales[number];
    }
    return sourceLocaleResolutionMap[locale as typeof sourceShortcutLocales[number]];
};

export const resolveTargetLocale = (locale: typeof targetLocales[number]): typeof targetFullLocales[number] => {
    if (targetFullLocales.includes(locale as typeof targetFullLocales[number])) {
        return locale as typeof targetFullLocales[number];
    }
    return targetLocaleResolutionMap[locale as typeof targetShortcutLocales[number]];
};

export const resolveLocale = (locale: typeof allLocales[number]): typeof fullLocales[number] => {
    if (fullLocales.includes(locale as typeof fullLocales[number])) {
        return locale as typeof fullLocales[number];
    }
    return localeResolutionMap[locale as typeof shortcutLocales[number]];
}