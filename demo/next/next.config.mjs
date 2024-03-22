import compiler from '@replexica/compiler';

/** @type {import('next').NextConfig} */
const nextConfig = {};

/** @type {import('@replexica/compiler').ReplexicaConfig} */
const replexicaConfig = {
  sourceLocale: 'en',
  debug: true,    
};

export default compiler.next(
  replexicaConfig,
  nextConfig,
);

