'use client'
import { formatTimeInTz, tzLabel } from '@/lib/timezone'
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
}

function formatCountdown(targetDate: string): string {
  const target = new Date(targetDate)
  const now = new Date()
  const diff = target.getTime() - now.getTime()

  if (diff <= 0) return 'Sedang berlangsung'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

function isOngoing(event: Event): boolean {
  const now = new Date()
  const start = new Date(event.startTime)
  const end = event.endTime ? new Date(event.endTime) : null
  if (end) return now >= start && now <= end
  return now >= start && now <= new Date(start.getTime() + 2 * 60 * 60 * 1000)
}

function getFloorLabel(floor: number): string {
  return `Lantai ${floor}`
}

export default function EventList({
  events,
  timezone = 'Asia/Makassar',
}: {
  events: Event[]
  timezone?: string
}) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  if (events.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-full text-center py-8'>
        <div className='text-5xl mb-4'>📅</div>
        <div className='text-ocean-300 text-lg font-medium'>
          Tidak ada kegiatan hari ini
        </div>
        <div className='text-ocean-400/60 text-sm mt-2'>Nikmati hari Anda!</div>
      </div>
    )
  }

  const nextEvent = events.find((e) => new Date(e.startTime) > new Date())

  return (
    <div
      className='flex flex-col gap-3 overflow-y-auto max-h-full pr-1 scrollbar-hide'
      data-tick={tick}
    >
      {/* Countdown to next event */}
      {nextEvent && (
        <div className='bg-linear-to-r from-crimson-800/80 to-crimson-700/60 rounded-xl p-3 border border-crimson-600/40 mb-1'>
          <div className='text-xs text-crimson-300 uppercase tracking-wider mb-1'>
            ⏱ Berikutnya
          </div>
          <div className='text-white font-semibold text-sm truncate'>
            {nextEvent.title}
          </div>
          <div className='text-2xl font-bold text-white tabular-nums tracking-wider'>
            {formatCountdown(nextEvent.startTime)}
          </div>
        </div>
      )}

      {/* Event list */}
      {events.map((event) => {
        const ongoing = isOngoing(event)
        return (
          <div
            key={event.id}
            className={`rounded-xl p-3 border transition-all ${
              ongoing
                ? 'bg-linear-to-r from-ocean-700/80 to-ocean-600/60 border-ocean-400/60 shadow-lg shadow-ocean-500/20'
                : 'bg-ocean-800/40 border-ocean-700/30'
            }`}
          >
            {ongoing && (
              <span className='inline-flex items-center gap-1 bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/30 mb-1'>
                <span className='w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse' />
                BERLANGSUNG
              </span>
            )}
            <div className='font-semibold text-white text-sm leading-tight'>
              {event.title}
            </div>
            <div className='flex items-center gap-1 text-ocean-300 text-xs mt-1'>
              <span>🕐</span>
              <span className='font-medium'>
                {formatTimeInTz(event.startTime, timezone)} {tzLabel(timezone)}
                {event.endTime
                  ? ` s/d ${formatTimeInTz(event.endTime, timezone)} ${tzLabel(timezone)}`
                  : ' s/d Selesai'}
              </span>
            </div>
            <div className='flex items-center gap-1 text-ocean-300 text-xs mt-0.5'>
              <span>📍</span>
              <span>
                {getFloorLabel(event.floor)}
                {event.room && ` • ${event.room}`}
              </span>
            </div>
            {event.organizer && (
              <div className='flex items-center gap-1 text-ocean-400 text-xs mt-0.5'>
                <span>👥</span>
                <span>{event.organizer}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
