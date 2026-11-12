import path from 'path';

/** Libera no next/image o domínio público do bucket do R2. */
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
    qualities: [75, 90],
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
      ...(cdnPattern ? [cdnPattern] : []),
    ],
  },
  turbopack: {
    root: path.resolve('../../../'),
  },
  // Target modern browsers only (ES2022+)
  experimental: {
    optimizePackageImports: ['@repo/ui', 'lucide-react'],
  },
  async headers() {
    return [
      {
        // O nome do arquivo leva a versão: ao trocar o vídeo, publique com outro nome.
        source: '/videos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/v2',
        destination: '/',
        permanent: true,
      },
    ];
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
