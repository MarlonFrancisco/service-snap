import path from 'path';

function cdnRemotePattern() {
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
  if (!cdnUrl) return null;

  try {
    const { protocol, hostname, pathname } = new URL(cdnUrl);
    if (protocol !== 'http:' && protocol !== 'https:') return null;
    return {
      protocol: protocol.replace(':', ''),
      hostname,
      pathname: pathname === '/' ? '/**' : `${pathname.replace(/\/$/, '')}/**`,
    };
  } catch {
    return null;
  }
}

const cdnPattern = cdnRemotePattern();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'qwprndmtjhwgmtngiwjg.supabase.co',
        pathname: '/**',
      },
      ...(cdnPattern ? [cdnPattern] : []),
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
    root: path.resolve('../../../'),
  },
  // Target modern browsers only (ES2022+)
  experimental: {
    optimizePackageImports: ['@repo/ui', 'lucide-react'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
