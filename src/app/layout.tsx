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
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom right, #111827, #000000, #111827)',
          color: 'white'
        }}>
          <nav style={{
            background: 'rgba(17, 24, 39, 0.95)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(75, 85, 99, 0.5)',
            position: 'sticky',
            top: 0,
            zIndex: 50
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '4rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <a href="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    textDecoration: 'none',
                    color: 'white'
                  }}>
                    <img alt="CodeCikgu" width="32" height="32" src="/favicon.svg" style={{
                      transition: 'transform 0.3s ease'
                    }} />
                    <span style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      background: 'linear-gradient(to right, #60a5fa, #06b6d4)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>CodeCikgu</span>
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <a href="/daftar" style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    transition: 'background-color 0.3s ease'
                  }}>Daftar</a>
                  <a href="/login" style={{
                    background: '#374151',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    transition: 'background-color 0.3s ease'
                  }}>Log Masuk</a>
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
