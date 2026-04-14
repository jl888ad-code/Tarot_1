/** @type {import('next').NextConfig} */
const nextConfig = {
  // 確保 API routes 在 Edge Runtime 也能正常運作
  experimental: {},
}

module.exports = nextConfig
