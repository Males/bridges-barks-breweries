import type { Metadata, Viewport } from 'next'
import { Playfair_Display } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Bridges, Barks & Breweries',
  description:
    'Find a dog walk near you that crosses bridges and ends at a brewery or pub.',
  openGraph: {
    title: 'Bridges, Barks & Breweries',
    description: 'Dog walks with bridges, finishing at a brewery.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#1A1344',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={playfair.variable}>
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-navy focus:text-cream focus:outline-none focus:ring-2 focus:ring-golden focus:ring-offset-2"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
