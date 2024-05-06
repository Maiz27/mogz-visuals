/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removing strict mode is required in order to get locomotive scroll working
  // properly in our Next.js app. This is a known issue with locomotive-scroll
  // and Next.js. https://github.com/locomotivemtl/locomotive-scroll/issues/458
  reactStrictMode: false,
};

export default nextConfig;
