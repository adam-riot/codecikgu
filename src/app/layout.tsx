
import type { Metadata } from "next"
import { Inter, Poppins, Rubik } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-poppins" })
const rubik = Rubik({ subsets: ["latin"], variable: "--font-rubik" })

export const metadata: Metadata = {
  title: 'CodeCikgu',
  description: 'Platform pembelajaran Sains Komputer yang interaktif',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${rubik.variable}`}>
      <body className={`${inter.className} font-inter`}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}


