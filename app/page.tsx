'use client'
import Clock from '@/components/display/Clock'
import EventList from '@/components/display/EventList'
import Marquee from '@/components/display/Marquee'
import MediaSlideshow from '@/components/display/MediaSlideshow'
import Weather from '@/components/display/Weather'
import { formatTimeInTz } from '@/lib/timezone'
import { useEffect, useState } from 'react'

interface Event {
  id: string
  title: string
  description?: string | null
  startTime: string
  endTime?: string | null
  floor: number
  room?: string | null
  organizer?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Announcement {
  id: string
  text: string
  isActive: boolean
  priority: number
  createdAt: string
  updatedAt: string
}

interface Media {
  id: string
  type: string
  url: string
  title?: string | null
  displayOrder: number
  duration: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface DisplayData {
  events: Event[]
  announcements: Announcement[]
  media: Media[]
  settings: Record<string, string>
}

const DEFAULT_SETTINGS = {
  campus_name: 'Universitas Kampus',
  logo_main: '',
  logo_1: '',
  logo_2: '',
  logo_3: '',
  logo_4: '',
  weather_city: 'Jakarta',
  default_media_url: '',
  bg_music_url: '',
  marquee_speed: '40',
  slide_duration: '10',
  timezone: 'Asia/Makassar',
}

export default function DisplayPage() {
  const [data, setData] = useState<DisplayData>({
    events: [],
    announcements: [],
    media: [],
    settings: DEFAULT_SETTINGS,
  })
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/display', { cache: 'no-store' })
      if (res.ok) {
        const json = (await res.json()) as DisplayData
        setData(json)
      }
    } catch (err: unknown) {
      console.error('Failed to fetch display data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const s = { ...DEFAULT_SETTINGS, ...data.settings }
  const announcementTexts = data.announcements.map((a) => a.text)
  const eventMarqueeTexts = data.events.map(
    (e) =>
      `📅 ${formatTimeInTz(e.startTime, s.timezone)} — ${e.title}${e.room ? ` (${e.room}, Lantai ${e.floor})` : ''}`
  )
  const allMarqueeTexts = [...announcementTexts, ...eventMarqueeTexts]
  const smallLogos = [s.logo_1, s.logo_2, s.logo_3, s.logo_4].filter(Boolean)

  if (loading) {
    return (
      <div
        className='w-screen h-screen flex items-center justify-center'
        style={{ background: '#03045e' }}
      >
        <div className='text-center'>
          <div
            className='w-16 h-16 border-4 border-ocean-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'
            style={{ borderColor: '#00b4d8', borderTopColor: 'transparent' }}
          />
          <div className='text-lg' style={{ color: '#ade8f4' }}>
            Memuat...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className='w-screen h-screen flex flex-col overflow-hidden'
      style={{
        background:
          'linear-gradient(135deg, #03045e 0%, #023e8a 50%, #03045e 100%)',
        userSelect: 'none',
      }}
    >
      {/* ─── HEADER ─── */}
      <header
        className='flex items-center justify-between px-6 py-3 shrink-0'
        style={{
          background:
            'linear-gradient(90deg, rgba(2,62,138,0.98) 0%, rgba(0,119,182,0.6) 50%, rgba(2,62,138,0.98) 100%)',
          borderBottom: '1px solid rgba(0,180,216,0.25)',
        }}
      >
        {/* Logo + Campus Name */}
        <div className='flex items-center gap-4'>
          {s.logo_main ? (
            <img
              src={s.logo_main}
              alt='Logo'
              className='h-12 w-12 object-contain'
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            <div
              className='h-12 w-12 rounded-full flex items-center justify-center text-2xl font-bold text-white'
              style={{
                background: 'linear-gradient(135deg, #0077b6, #00b4d8)',
              }}
            >
              🎓
            </div>
          )}
          <div>
            <h1 className='text-xl font-bold text-white tracking-wide'>
              {s.campus_name}
            </h1>
            <div
              className='text-xs uppercase tracking-widest'
              style={{ color: '#90e0ef' }}
            >
              Campus Information Board
            </div>
          </div>
        </div>

        {/* 4 small logos (center) */}
        {smallLogos.length > 0 && (
          <div className='flex items-center gap-4'>
            {smallLogos.map((logo, i) => (
              <img
                key={i}
                src={logo}
                alt={`Logo ${i + 1}`}
                className='h-10 w-10 object-contain opacity-90'
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ))}
          </div>
        )}

        {/* Clock + Weather */}
        <div className='flex items-center gap-6'>
          <Weather />
          <Clock timezone={s.timezone} />
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <div className='flex flex-1 gap-4 p-4 min-h-0'>
        {/* LEFT: Event Schedule (fixed width) */}
        <div
          className='flex flex-col gap-3 overflow-hidden'
          style={{ width: '320px', flexShrink: 0 }}
        >
          <div className='flex items-center gap-2 shrink-0'>
            <div
              className='h-5 w-1 rounded'
              style={{ background: '#c1121f' }}
            />
            <h2
              className='text-xs font-bold uppercase tracking-wider'
              style={{ color: '#90e0ef' }}
            >
              Jadwal Kegiatan Hari Ini
            </h2>
          </div>
          <div className='flex-1 overflow-hidden'>
            <EventList events={data.events} timezone={s.timezone} />
          </div>
        </div>

        {/* DIVIDER */}
        <div
          className='w-px shrink-0 self-stretch'
          style={{ background: 'rgba(0,180,216,0.2)' }}
        />

        {/* RIGHT: Media Slideshow */}
        <div className='flex-1 min-w-0 h-full'>
          <MediaSlideshow
            items={data.media}
            defaultVideoUrl={s.default_media_url}
            bgMusicUrl={s.bg_music_url}
          />
        </div>
      </div>

      {/* ─── MARQUEE BAR ─── */}
      {allMarqueeTexts.length > 0 ? (
        <Marquee texts={allMarqueeTexts} speed={parseInt(s.marquee_speed)} />
      ) : (
        <div
          className='shrink-0 py-2 text-center text-xs'
          style={{
            color: '#90e0ef',
            background: 'rgba(2,62,138,0.8)',
            borderTop: '1px solid rgba(0,180,216,0.2)',
          }}
        >
          {s.campus_name} · Campus Information Board
        </div>
      )}

      {/* ─── BOTTOM ACCENT LINE ─── */}
      <div
        className='h-1 shrink-0 w-full'
        style={{
          background:
            'linear-gradient(90deg, #03045e, #c1121f 25%, #0077b6 50%, #c1121f 75%, #03045e)',
        }}
      />
    </div>
  )
}
