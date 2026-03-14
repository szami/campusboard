'use client'
import { formatDateInTz, tzLabel } from '@/lib/timezone'
import { useEffect, useState } from 'react'

export default function Clock({
  timezone = 'Asia/Makassar',
}: {
  timezone?: string
}) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeStr = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: timezone,
    hour12: false,
  }).format(time)

  const label = tzLabel(timezone)

  return (
    <div className='text-right'>
      <div className='text-5xl font-bold text-white tabular-nums tracking-wider drop-shadow-lg'>
        {timeStr}{' '}
        <span className='text-xl font-normal opacity-70'>{label}</span>
      </div>
      <div className='text-sm text-ocean-300 mt-1 capitalize'>
        {formatDateInTz(time, timezone)}
      </div>
    </div>
  )
}
