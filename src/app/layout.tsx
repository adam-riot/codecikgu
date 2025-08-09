import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

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
  metadataBase: new URL('https://codecikgu.vercel.app'),
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
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light )', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ms">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="16x16" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="mask-icon" href="/favicon.svg" color="#00d4ff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CodeCikgu" />
        <meta name="application-name" content="CodeCikgu" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="preload" href="/favicon.svg" as="image" type="image/svg+xml" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <nav className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-8">
                  <a className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-300" href="/">
                    <img alt="CodeCikgu" width="32" height="32" className="hover:scale-110 transition-transform duration-300" src="/favicon.svg"/>
                    <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">CodeCikgu</span>
                  </a>
                </div>
                <div className="flex items-center space-x-4">
                  <a href="/daftar" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">Daftar</a>
                  <a href="/login" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">Log Masuk</a>
                </div>
              </div>
            </div>
          </nav>
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
