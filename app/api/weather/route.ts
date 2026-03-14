import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    let lat = searchParams.get('lat')
    let lon = searchParams.get('lon')

    if (!lat || !lon) {
      const latSetting = await prisma.setting.findUnique({
        where: { key: 'weather_lat' },
      })
      const lonSetting = await prisma.setting.findUnique({
        where: { key: 'weather_lon' },
      })
      lat = latSetting?.value ?? '-6.2088'
      lon = lonSetting?.value ?? '106.8456'
    }

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relativehumidity_2m,weathercode,windspeed_10m&timezone=auto`,
      { next: { revalidate: 1800 } }
    )

    if (!res.ok) throw new Error('Weather API failed')

    const data = await res.json()
    const current = data.current

    const weatherCodeMap: Record<number, { label: string; icon: string }> = {
      0: { label: 'Cerah', icon: '☀️' },
      1: { label: 'Sebagian Cerah', icon: '🌤️' },
      2: { label: 'Berawan Sebagian', icon: '⛅' },
      3: { label: 'Berawan', icon: '☁️' },
      45: { label: 'Berkabut', icon: '🌫️' },
      48: { label: 'Berkabut', icon: '🌫️' },
      51: { label: 'Gerimis', icon: '🌦️' },
      53: { label: 'Gerimis', icon: '🌦️' },
      55: { label: 'Gerimis Lebat', icon: '🌧️' },
      61: { label: 'Hujan Ringan', icon: '🌧️' },
      63: { label: 'Hujan', icon: '🌧️' },
      65: { label: 'Hujan Lebat', icon: '⛈️' },
      80: { label: 'Hujan Lokal', icon: '🌦️' },
      81: { label: 'Hujan Lokal', icon: '🌧️' },
      82: { label: 'Hujan Deras', icon: '⛈️' },
      95: { label: 'Berguntur', icon: '⛈️' },
      96: { label: 'Berguntur + Es', icon: '⛈️' },
      99: { label: 'Berguntur + Es Lebat', icon: '⛈️' },
    }

    const code = current.weathercode
    const weather = weatherCodeMap[code] ?? {
      label: 'Tidak Diketahui',
      icon: '🌡️',
    }

    return NextResponse.json({
      temperature: Math.round(current.temperature_2m),
      humidity: current.relativehumidity_2m,
      windspeed: Math.round(current.windspeed_10m),
      condition: weather.label,
      icon: weather.icon,
    })
  } catch (error) {
    return NextResponse.json(
      {
        temperature: '--',
        humidity: '--',
        windspeed: '--',
        condition: 'Tidak tersedia',
        icon: '🌡️',
      },
      { status: 200 }
    )
  }
}
