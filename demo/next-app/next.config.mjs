import replexica from 'replexica/compiler';

/** @type {import('next').NextConfig} */
const nextConfig = {
};

export default replexica.next({ rsc: true, debug: true })(nextConfig);
// export default nextConfig;