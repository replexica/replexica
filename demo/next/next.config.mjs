import compiler from '@replexica/compiler';

/** @type {import('next').NextConfig} */
const nextConfig = {};

/** @type {import('@replexica/compiler').ReplexicaConfig} */
const replexicaConfig = {
  outDir: '.next',
  i18nDir: 'src/i18n',
  sourceLocale: 'en',
  debug: true,    
};

export default compiler.next(
  replexicaConfig,
  nextConfig,
);
