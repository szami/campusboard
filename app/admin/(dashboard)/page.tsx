import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59
  )

  const [totalEvents, todayEvents, totalMedia, activeAnnouncements] =
    await Promise.all([
      prisma.event.count({ where: { isActive: true } }),
      prisma.event.count({
        where: {
          isActive: true,
          startTime: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.media.count({ where: { isActive: true } }),
      prisma.announcement.count({ where: { isActive: true } }),
    ])

  const nextEvent = await prisma.event.findFirst({
    where: { isActive: true, startTime: { gte: now } },
    orderBy: { startTime: 'asc' },
  })

  const recentEvents = await prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  const stats = [
    {
      label: 'Event Hari Ini',
      value: todayEvents,
      icon: '📅',
      color: '#00b4d8',
      href: '/admin/events',
    },
    {
      label: 'Total Event Aktif',
      value: totalEvents,
      icon: '🗓️',
      color: '#0077b6',
      href: '/admin/events',
    },
    {
      label: 'Media Aktif',
      value: totalMedia,
      icon: '🎬',
      color: '#23a6d5',
      href: '/admin/media',
    },
    {
      label: 'Pengumuman Aktif',
      value: activeAnnouncements,
      icon: '📢',
      color: '#c1121f',
      href: '/admin/announcements',
    },
  ]

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h1 className='text-2xl font-bold' style={{ color: '#023e8a' }}>
          Dashboard
        </h1>
        <p className='text-sm text-gray-500 mt-1'>
          Selamat datang di panel admin CampusBoard
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow'
          >
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-xs text-gray-500 font-medium uppercase tracking-wide'>
                  {stat.label}
                </p>
                <p
                  className='text-3xl font-bold mt-1'
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </p>
              </div>
              <span className='text-3xl'>{stat.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Next Event Countdown */}
      {nextEvent && (
        <div
          className='rounded-2xl p-5 text-white'
          style={{ background: 'linear-gradient(135deg, #023e8a, #0077b6)' }}
        >
          <div className='text-xs uppercase tracking-widest mb-2 opacity-70'>
            ⏱ Event Berikutnya
          </div>
          <div className='text-xl font-bold'>{nextEvent.title}</div>
          <div className='flex items-center gap-4 mt-2 text-sm opacity-80'>
            <span>
              🕐{' '}
              {new Date(nextEvent.startTime).toLocaleString('id-ID', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {nextEvent.room && (
              <span>
                📍 {nextEvent.room}, Lantai {nextEvent.floor}
              </span>
            )}
            {nextEvent.organizer && <span>👥 {nextEvent.organizer}</span>}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className='text-lg font-semibold text-gray-700 mb-3'>Aksi Cepat</h2>
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
          {[
            {
              href: '/admin/events',
              label: 'Tambah Event',
              icon: '➕',
              color: '#0077b6',
            },
            {
              href: '/admin/media',
              label: 'Tambah Media',
              icon: '🎬',
              color: '#023e8a',
            },
            {
              href: '/admin/announcements',
              label: 'Tambah Pengumuman',
              icon: '📢',
              color: '#c1121f',
            },
            {
              href: '/admin/settings',
              label: 'Pengaturan',
              icon: '⚙️',
              color: '#6b0000',
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className='flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center'
            >
              <span className='text-2xl'>{action.icon}</span>
              <span className='text-xs font-medium text-gray-600'>
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <div>
          <h2 className='text-lg font-semibold text-gray-700 mb-3'>
            Event Terbaru
          </h2>
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
            <table className='w-full text-sm'>
              <thead>
                <tr
                  className='border-b border-gray-100'
                  style={{ background: '#f8faff' }}
                >
                  <th className='text-left px-4 py-3 text-gray-500 font-medium'>
                    Nama
                  </th>
                  <th className='text-left px-4 py-3 text-gray-500 font-medium'>
                    Waktu
                  </th>
                  <th className='text-left px-4 py-3 text-gray-500 font-medium'>
                    Lokasi
                  </th>
                  <th className='text-left px-4 py-3 text-gray-500 font-medium'>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((event) => (
                  <tr
                    key={event.id}
                    className='border-b border-gray-50 hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-4 py-3 font-medium text-gray-800'>
                      {event.title}
                    </td>
                    <td className='px-4 py-3 text-gray-600'>
                      {new Date(event.startTime).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className='px-4 py-3 text-gray-600'>
                      {event.room ? `${event.room}, ` : ''}Lantai {event.floor}
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${event.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {event.isActive ? '● Aktif' : '○ Nonaktif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
