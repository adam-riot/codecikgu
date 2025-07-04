import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CodeCikgu - Platform Pembelajaran Sains Komputer',
  description: 'Platform pembelajaran Sains Komputer yang interaktif untuk murid Tingkatan 4 & 5. Belajar dengan cara yang menyeronokkan dan dapatkan ganjaran!',
  keywords: ['sains komputer', 'programming', 'coding', 'malaysia', 'tingkatan 4', 'tingkatan 5', 'SPM', 'pembelajaran'],
  authors: [{ name: 'CodeCikgu Team' }],
  creator: 'CodeCikgu',
  publisher: 'CodeCikgu',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://codecikgu.vercel.app' ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CodeCikgu - Platform Pembelajaran Sains Komputer',
    description: 'Platform pembelajaran Sains Komputer yang interaktif untuk murid Tingkatan 4 & 5. Belajar dengan cara yang menyeronokkan dan dapatkan ganjaran!',
    url: 'https://codecikgu.vercel.app',
    siteName: 'CodeCikgu',
    images: [
      {
        url: '/favicon.svg',
        width: 1200,
        height: 630,
        alt: 'CodeCikgu Logo',
      },
    ],
    locale: 'ms_MY',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeCikgu - Platform Pembelajaran Sains Komputer',
    description: 'Platform pembelajaran Sains Komputer yang interaktif untuk murid Tingkatan 4 & 5.',
    images: ['/favicon.svg'],
    creator: '@codecikgu',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml', sizes: '16x16' },
    ],
    apple: [
      { url: '/favicon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon.svg',
        color: '#00d4ff',
      },
    ],
  },
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: light )', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ms">
      <head>
        {/* Additional favicon links for better browser support */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="16x16" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="mask-icon" href="/favicon.svg" color="#00d4ff" />
        
        {/* PWA and mobile optimization */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CodeCikgu" />
        <meta name="application-name" content="CodeCikgu" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/favicon.svg" as="image" type="image/svg+xml" />
      </head>
      <body className={inter.className}>
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
