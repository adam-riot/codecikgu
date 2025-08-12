import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { ThemeProvider } from '@/components/ThemeProvider'
import { NotificationProvider } from '@/components/NotificationProvider'
import EnvironmentStatus from '@/components/EnvironmentStatus'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CodeCikgu - Platform Pembelajaran Sains Komputer',
  description: 'Platform pembelajaran sains komputer yang interaktif dan gamified untuk pelajar Malaysia',
  keywords: 'sains komputer, pendidikan, Malaysia, DSKP, coding, programming',
  authors: [{ name: 'CodeCikgu Team' }],
  creator: 'CodeCikgu',
  publisher: 'CodeCikgu',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://codecikgu.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CodeCikgu - Platform Pembelajaran Sains Komputer',
    description: 'Platform pembelajaran sains komputer yang interaktif dan gamified untuk pelajar Malaysia',
    url: 'https://codecikgu.com',
    siteName: 'CodeCikgu',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CodeCikgu Platform',
      },
    ],
    locale: 'ms_MY',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeCikgu - Platform Pembelajaran Sains Komputer',
    description: 'Platform pembelajaran sains komputer yang interaktif dan gamified untuk pelajar Malaysia',
    images: ['/og-image.jpg'],
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
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'education',
  classification: 'educational software',
  referrer: 'origin-when-cross-origin',

}

export const viewport = {
  colorScheme: 'dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
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
        <ThemeProvider>
          <NotificationProvider>
            <div style={{
              minHeight: '100vh',
              background: 'linear-gradient(to bottom right, #111827, #000000, #111827)',
              color: 'white'
            }}>
              <EnvironmentStatus />
              <Navbar />
              <main>
                {children}
              </main>
            </div>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
