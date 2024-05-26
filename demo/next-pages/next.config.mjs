import replexica from '@replexica/compiler';
import i18n from './i18n.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: [...i18n.params.supportedLocales, '$'],
    defaultLocale: '$',
    localeDetection: false,
  },
};

export default replexica.next({ debug: true })(nextConfig);
