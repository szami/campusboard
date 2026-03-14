'use client'
import { TIMEZONE_OPTIONS } from '@/lib/timezone'
import { useEffect, useRef, useState } from 'react'

interface SettingMap {
  [key: string]: string
}

const DEFAULT_SETTINGS: SettingMap = {
  campus_name: 'Universitas Kampus',
  logo_main: '',
  logo_1: '',
  logo_2: '',
  logo_3: '',
  logo_4: '',
  weather_lat: '-6.2088',
  weather_lon: '106.8456',
  default_media_url: '',
  bg_music_url: '',
  marquee_speed: '30',
  slide_duration: '8',
  timezone: 'Asia/Makassar',
}

const LABELS: Record<
  string,
  { label: string; placeholder?: string; hint?: string; isImage?: boolean }
> = {
  campus_name: { label: 'Nama Kampus', placeholder: 'ex: Universitas Contoh' },
  logo_main: {
    label: 'Logo Utama',
    isImage: true,
    hint: 'Logo utama di header',
  },
  logo_1: { label: 'Logo Kecil 1', isImage: true },
  logo_2: { label: 'Logo Kecil 2', isImage: true },
  logo_3: { label: 'Logo Kecil 3', isImage: true },
  logo_4: { label: 'Logo Kecil 4', isImage: true },
  weather_lat: {
    label: 'Latitude',
    placeholder: '-6.2088',
    hint: 'Koordinat lintang',
  },
  weather_lon: {
    label: 'Longitude',
    placeholder: '106.8456',
    hint: 'Koordinat bujur',
  },
  default_media_url: {
    label: 'URL Video Default (YouTube)',
    placeholder: 'https://www.youtube.com/watch?v=...',
  },
  bg_music_url: {
    label: 'Musik Latar (Mode Gambar)',
    placeholder: '/uploads/music.mp3 atau https://...',
    hint: 'Audio yang diputar otomatis saat menampilkan slideshow gambar',
  },
  marquee_speed: { label: 'Kecepatan Marquee (detik)', placeholder: '30' },
  slide_duration: { label: 'Durasi Slide (detik)', placeholder: '8' },
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingMap>({ ...DEFAULT_SETTINGS })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState<string | null>(null)

  // Individual refs for each logo upload input
  const refLogoMain = useRef<HTMLInputElement>(null)
  const refLogo1 = useRef<HTMLInputElement>(null)
  const refLogo2 = useRef<HTMLInputElement>(null)
  const refLogo3 = useRef<HTMLInputElement>(null)
  const refLogo4 = useRef<HTMLInputElement>(null)
  const refBgMusic = useRef<HTMLInputElement>(null)

  const imageRefs: Record<string, React.RefObject<HTMLInputElement | null>> = {
    logo_main: refLogoMain,
    logo_1: refLogo1,
    logo_2: refLogo2,
    logo_3: refLogo3,
    logo_4: refLogo4,
  }

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data: SettingMap) => setSettings((prev) => ({ ...prev, ...data })))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setMsg(res.ok ? '✅ Pengaturan berhasil disimpan!' : '❌ Gagal menyimpan')
    setSaving(false)
    setTimeout(() => setMsg(''), 4000)
  }

  const handleUpload = async (key: string, file: File) => {
    setUploading(key)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (res.ok) {
      const data = await res.json()
      setSettings((prev) => ({ ...prev, [key]: data.url }))
    } else {
      setMsg('❌ Upload gagal')
    }
    setUploading(null)
  }

  const set = (key: string, value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }))

  if (loading)
    return (
      <div className='p-6 text-center text-gray-400'>Memuat pengaturan...</div>
    )

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold' style={{ color: '#023e8a' }}>
          Pengaturan Sistem
        </h1>
        <p className='text-sm text-gray-500 mt-1'>
          Konfigurasi tampilan layar informasi kampus
        </p>
      </div>

      {msg && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
        >
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className='space-y-6'>
        {/* Identitas Kampus */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
          <h2 className='text-base font-bold mb-4' style={{ color: '#023e8a' }}>
            🏫 Identitas Kampus
          </h2>
          <div className='space-y-4'>
            {/* campus_name */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                {LABELS.campus_name.label}
              </label>
              <input
                value={settings.campus_name ?? ''}
                onChange={(e) => set('campus_name', e.target.value)}
                className='w-full border rounded-xl px-4 py-2.5 text-sm'
                style={{ borderColor: '#d0e8f5' }}
                placeholder={LABELS.campus_name.placeholder}
              />
            </div>

            {/* timezone */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Zona Waktu
              </label>
              <p className='text-xs text-gray-400 mb-2'>
                Zona waktu yang ditampilkan di jam dan jadwal kegiatan
              </p>
              <div className='grid grid-cols-3 gap-2'>
                {TIMEZONE_OPTIONS.map((tz) => (
                  <button
                    key={tz.value}
                    type='button'
                    onClick={() => set('timezone', tz.value)}
                    className='py-2 px-3 rounded-xl text-xs font-medium border transition-all text-left'
                    style={{
                      background:
                        settings.timezone === tz.value
                          ? 'rgba(0,119,182,0.15)'
                          : 'transparent',
                      borderColor:
                        settings.timezone === tz.value ? '#0077b6' : '#e5e7eb',
                      color:
                        settings.timezone === tz.value ? '#0077b6' : '#6b7280',
                    }}
                  >
                    <div className='font-bold'>{tz.short}</div>
                    <div className='opacity-70 mt-0.5'>
                      {tz.label.split(' — ')[1]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* logos */}
            {(
              ['logo_main', 'logo_1', 'logo_2', 'logo_3', 'logo_4'] as const
            ).map((key) => (
              <div key={key}>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  {LABELS[key].label}
                </label>
                {LABELS[key].hint && (
                  <p className='text-xs text-gray-400 mb-2'>
                    {LABELS[key].hint}
                  </p>
                )}
                <div className='flex gap-2 items-center'>
                  {settings[key] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={settings[key]}
                      alt={key}
                      className='w-12 h-12 rounded-lg object-contain border bg-gray-50'
                    />
                  )}
                  <input
                    value={settings[key] ?? ''}
                    onChange={(e) => set(key, e.target.value)}
                    className='flex-1 border rounded-xl px-3 py-2 text-sm'
                    style={{ borderColor: '#d0e8f5' }}
                    placeholder='/uploads/logo.png atau https://...'
                  />
                  <button
                    type='button'
                    onClick={() => imageRefs[key]?.current?.click()}
                    disabled={uploading === key}
                    className='px-3 py-2 rounded-xl text-sm text-white whitespace-nowrap'
                    style={{ background: '#0077b6' }}
                  >
                    {uploading === key ? '⏳' : '📁'}
                  </button>
                </div>
                <input
                  ref={imageRefs[key] as React.RefObject<HTMLInputElement>}
                  type='file'
                  className='hidden'
                  accept='image/*'
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleUpload(key, f)
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Cuaca */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
          <h2 className='text-base font-bold mb-4' style={{ color: '#023e8a' }}>
            🌤️ Lokasi Cuaca
          </h2>
          <div className='grid grid-cols-2 gap-4'>
            {(['weather_lat', 'weather_lon'] as const).map((key) => (
              <div key={key}>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  {LABELS[key].label}
                </label>
                <p className='text-xs text-gray-400 mb-2'>{LABELS[key].hint}</p>
                <input
                  value={settings[key] ?? ''}
                  onChange={(e) => set(key, e.target.value)}
                  className='w-full border rounded-xl px-4 py-2.5 text-sm'
                  style={{ borderColor: '#d0e8f5' }}
                  placeholder={LABELS[key].placeholder}
                />
              </div>
            ))}
          </div>
          <a
            href='https://www.latlong.net/'
            target='_blank'
            rel='noreferrer'
            className='text-xs text-blue-500 hover:underline mt-2 block'
          >
            → Cari koordinat lokasi kampus di latlong.net
          </a>
        </div>

        {/* Media */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
          <h2 className='text-base font-bold mb-4' style={{ color: '#023e8a' }}>
            🎬 Media & Tampilan
          </h2>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                {LABELS.default_media_url.label}
              </label>
              <input
                value={settings.default_media_url ?? ''}
                onChange={(e) => set('default_media_url', e.target.value)}
                className='w-full border rounded-xl px-4 py-2.5 text-sm'
                style={{ borderColor: '#d0e8f5' }}
                placeholder={LABELS.default_media_url.placeholder}
              />
            </div>
            {/* bg_music_url */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                {LABELS.bg_music_url.label}
              </label>
              <p className='text-xs text-gray-400 mb-2'>
                {LABELS.bg_music_url.hint}
              </p>
              <div className='flex gap-2 items-center'>
                <input
                  value={settings.bg_music_url ?? ''}
                  onChange={(e) => set('bg_music_url', e.target.value)}
                  className='flex-1 border rounded-xl px-3 py-2 text-sm'
                  style={{ borderColor: '#d0e8f5' }}
                  placeholder={LABELS.bg_music_url.placeholder}
                />
                <button
                  type='button'
                  onClick={() => refBgMusic.current?.click()}
                  disabled={uploading === 'bg_music_url'}
                  className='px-3 py-2 rounded-xl text-sm text-white whitespace-nowrap'
                  style={{ background: '#0077b6' }}
                >
                  {uploading === 'bg_music_url' ? '⏳' : '🎵'}
                </button>
              </div>
              {settings.bg_music_url && (
                <audio
                  src={settings.bg_music_url}
                  controls
                  className='w-full mt-2 h-8'
                  style={{ accentColor: '#0077b6' }}
                />
              )}
              <input
                ref={refBgMusic}
                type='file'
                className='hidden'
                accept='audio/*'
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleUpload('bg_music_url', f)
                }}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              {(['slide_duration', 'marquee_speed'] as const).map((key) => (
                <div key={key}>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {LABELS[key].label}
                  </label>
                  <input
                    type='number'
                    value={settings[key] ?? ''}
                    onChange={(e) => set(key, e.target.value)}
                    className='w-full border rounded-xl px-4 py-2.5 text-sm'
                    style={{ borderColor: '#d0e8f5' }}
                    placeholder={LABELS[key].placeholder}
                    min={1}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='flex gap-4'>
          <button
            type='submit'
            disabled={saving}
            className='flex-1 py-3 rounded-xl text-white font-medium'
            style={{ background: 'linear-gradient(135deg, #0077b6, #00b4d8)' }}
          >
            {saving ? 'Menyimpan...' : '💾 Simpan Semua Pengaturan'}
          </button>
          <a
            href='/'
            target='_blank'
            className='px-6 py-3 rounded-xl border text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center'
          >
            👁 Preview Layar
          </a>
        </div>
      </form>
    </div>
  )
}
