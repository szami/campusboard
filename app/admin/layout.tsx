import NextAuthProvider from '@/components/admin/NextAuthProvider'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CampusBoard Admin',
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <NextAuthProvider>{children}</NextAuthProvider>
}
