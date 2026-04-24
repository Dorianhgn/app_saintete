import { withPayload } from '@payloadcms/next/withPayload'
import withPWA from '@ducanh2912/next-pwa'
import type { NextConfig } from 'next' // 1. Importe le type

const withPWAConfig = withPWA({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
})

// 2. Type explicitement la variable nextConfig
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https', // Maintenant TS sait que c'est le littéral 'https'
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
}

export default withPayload(withPWAConfig(nextConfig))