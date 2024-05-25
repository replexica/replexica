import replexica from '@replexica/compiler';

/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: false,
      },
    ];
  }
};

export default replexica.next()(nextConfig);
