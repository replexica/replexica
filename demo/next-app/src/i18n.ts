import { createI18nLoader, localeResolvers } from '@replexica/react/next';

export default createI18nLoader({
  resolver: localeResolvers.cookie,
  locales: {
    en: () => import('@replexica/translations/en.json'),
    es: () => import('@replexica/translations/es.json'),
  },
});