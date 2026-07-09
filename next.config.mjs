/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  sassOptions: {
    // Silence Dart Sass 3.0 deprecation noise if you use legacy APIs anywhere.
    quietDeps: true,
  },
};

export default nextConfig;