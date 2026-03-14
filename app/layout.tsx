import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CampusBoard - Campus Information Display',
  description:
    'Campus information display system for events, announcements, and media',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='id'>
      <body className='antialiased'>{children}</body>
    </html>
  )
}
