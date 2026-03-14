'use client'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '🏠' },
  { href: '/admin/events', label: 'Jadwal Kegiatan', icon: '📅' },
  { href: '/admin/media', label: 'Media', icon: '🎬' },
  { href: '/admin/announcements', label: 'Pengumuman', icon: '📢' },
  { href: '/admin/settings', label: 'Pengaturan', icon: '⚙️' },
]

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    const saved = localStorage.getItem('admin-theme')
    if (saved === 'dark') setIsDark(true)
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    localStorage.setItem('admin-theme', next ? 'dark' : 'light')
  }

  if (status === 'loading') {
    return (
      <div
        className='min-h-screen flex items-center justify-center'
        style={{ background: '#03045e' }}
      >
        <div className='text-white'>Memuat...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') return null

  return (
    <div
      className={`min-h-screen flex admin-wrap${isDark ? ' admin-dark' : ''}`}
      style={{ background: isDark ? '#0f172a' : '#f0f4f8' }}
    >
      {/* Sidebar */}
      <aside
        className='w-64 shrink-0 flex flex-col'
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #020924 0%, #01143d 100%)'
            : 'linear-gradient(180deg, #03045e 0%, #023e8a 100%)',
        }}
      >
        {/* Logo */}
        <div
          className='p-5 border-b'
          style={{ borderColor: 'rgba(0,180,216,0.2)' }}
        >
          <div className='flex items-center gap-3'>
            <span className='text-2xl'>🎓</span>
            <div>
              <div className='font-bold text-white text-sm'>CampusBoard</div>
              <div className='text-xs' style={{ color: '#90e0ef' }}>
                Admin Panel
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className='flex-1 p-4 space-y-1'>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className='flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium'
                style={{
                  background: isActive ? 'rgba(0,180,216,0.2)' : 'transparent',
                  color: isActive ? '#90e0ef' : 'rgba(255,255,255,0.7)',
                  borderLeft: isActive
                    ? '3px solid #00b4d8'
                    : '3px solid transparent',
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User info + logout */}
        <div
          className='p-4 border-t'
          style={{ borderColor: 'rgba(0,180,216,0.2)' }}
        >
          <div className='text-xs mb-3' style={{ color: '#90e0ef' }}>
            👤 {session?.user?.name ?? 'Admin'}
          </div>
          {/* Dark / Light mode toggle */}
          <button
            onClick={toggleTheme}
            className='w-full flex items-center justify-between px-3 py-2 rounded-lg mb-2 text-xs transition-all'
            style={{ background: 'rgba(0,180,216,0.12)', color: '#ade8f4' }}
            title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          >
            <span>{isDark ? '☀️ Mode Terang' : '🌙 Mode Gelap'}</span>
            <span
              className='inline-flex items-center justify-center w-8 h-4 rounded-full transition-all'
              style={{
                background: isDark ? '#00b4d8' : 'rgba(255,255,255,0.2)',
              }}
            >
              <span
                className='w-3 h-3 rounded-full bg-white transition-all block'
                style={{
                  transform: isDark ? 'translateX(4px)' : 'translateX(-4px)',
                }}
              />
            </span>
          </button>
          <div className='flex gap-2'>
            <Link
              href='/'
              target='_blank'
              className='flex-1 py-2 px-3 rounded-lg text-xs text-center transition-all'
              style={{ background: 'rgba(0,119,182,0.3)', color: '#ade8f4' }}
            >
              📺 Preview
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className='flex-1 py-2 px-3 rounded-lg text-xs transition-all'
              style={{ background: 'rgba(193,18,31,0.3)', color: '#ff6b6b' }}
            >
              🚪 Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className='flex-1 overflow-auto'
        style={{ color: isDark ? '#e2e8f0' : '#111827' }}
      >
        {children}
      </main>
    </div>
  )
}
