'use client'
import { useEffect, useState } from 'react'

interface WeatherData {
  temperature: number | string
  humidity: number | string
  windspeed: number | string
  condition: string
  icon: string
}

export default function Weather({ city }: { city?: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('/api/weather', { cache: 'no-store' })
        const data = await res.json()
        setWeather(data)
      } catch {
        setWeather({
          temperature: '--',
          humidity: '--',
          windspeed: '--',
          condition: 'Tidak tersedia',
          icon: '🌡️',
        })
      }
    }

    fetchWeather()
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (!weather)
    return (
      <div className='flex items-center gap-2 text-ocean-300 animate-pulse'>
        <span className='text-2xl'>🌡️</span>
        <span className='text-sm'>Memuat...</span>
      </div>
    )

  return (
    <div className='flex items-center gap-3 bg-ocean-800/50 rounded-xl px-4 py-2 border border-ocean-600/30'>
      <span className='text-4xl'>{weather.icon}</span>
      <div>
        <div className='text-2xl font-bold text-white'>
          {weather.temperature}°C
        </div>
        <div className='text-xs text-ocean-300'>{weather.condition}</div>
      </div>
      <div className='text-xs text-ocean-300 border-l border-ocean-600/40 pl-3'>
        <div>💧 {weather.humidity}%</div>
        <div>💨 {weather.windspeed} km/h</div>
      </div>
    </div>
  )
}
