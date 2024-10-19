import { createIntl } from '@formatjs/intl';

const localeMappings = {
  en: () => import('../locales/en.json').then((module) => module.default),
  es: () => import('../locales/es.json').then((module) => module.default),
};

export default async function loadIntl(locale: string) {
  const dictionary = await localeMappings[locale as keyof typeof localeMappings]();
  return createIntl({
    locale,
    messages: dictionary,
  });
}
