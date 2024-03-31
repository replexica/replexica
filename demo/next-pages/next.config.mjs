import compiler from '@replexica/compiler';

/** @type {import('next').NextConfig} */
const nextConfig = {};

/** @type {import('@replexica/compiler').ReplexicaConfig} */
const replexicaConfig = {
  rsc: false,
  locale: {
    source: 'en',
    targets: ['es'],
  },
  debug: true,    
};

export default compiler.next(
  replexicaConfig,
  nextConfig,
);
