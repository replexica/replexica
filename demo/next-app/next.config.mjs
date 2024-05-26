import replexica from '@replexica/compiler';

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default replexica.next({ debug: true })(nextConfig);
