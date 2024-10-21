import { createIntl } from '@formatjs/intl';
import { headers } from 'next/headers';
import i18nJson from '../../i18n.json';

const defaultLocale = i18nJson.locale.source;

const localeMappings = {
  en: () => import('../locales/en.json').then((module) => module.default),
  es: () => import('../locales/es.json').then((module) => module.default),
};

export default async function loadIntl(_locale?: string) {
  let locale: string | undefined | null = _locale;
  if (!locale) {
    locale = getLocaleFromHeaders();
  }
  if (!locale) {
    locale = defaultLocale;
  }
  const dictionary = await localeMappings[locale as keyof typeof localeMappings]();
  return createIntl({
    locale,
    messages: dictionary,
  });
}

function getLocaleFromHeaders() {
  const headersValue = headers();

  const result = headersValue.get('X-Locale');
  return result || null;
}
