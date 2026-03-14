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

const EMPTY_FORM = {
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  floor: 1,
  room: '',
  organizer: '',
  isActive: true,
}

function toDatetimeLocal(dt: string) {
  if (!dt) return ''
  return new Date(dt).toISOString().slice(0, 16)
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [timezone, setTimezone] = useState('Asia/Makassar')

  const fetchEvents = async () => {
    const res = await fetch('/api/events')
    if (res.ok) setEvents(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    const init = async () => {
      await fetchEvents()
      try {
        const res = await fetch('/api/settings')
        const d = await res.json()
        if (d.timezone) setTimezone(d.timezone)
      } catch {
        // ignore
      }
    }
    void init()
  }, [])

  const openAdd = () => {
    setEditId(null)
    setForm({ ...EMPTY_FORM })
    setShowForm(true)
    setMsg('')
  }

  const openEdit = (e: Event) => {
    setEditId(e.id)
    setForm({
      title: e.title,
      description: e.description ?? '',
      startTime: toDatetimeLocal(e.startTime),
      endTime: e.endTime ? toDatetimeLocal(e.endTime) : '',
      floor: e.floor,
      room: e.room ?? '',
      organizer: e.organizer ?? '',
      isActive: e.isActive,
    })
    setShowForm(true)
    setMsg('')
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setSaving(true)
    setMsg('')

    const payload = {
      ...form,
      startTime: new Date(form.startTime).toISOString(),
      endTime: form.endTime ? new Date(form.endTime).toISOString() : undefined,
    }

    const url = editId ? `/api/events/${editId}` : '/api/events'
    const method = editId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      setMsg('✅ Berhasil disimpan')
      setShowForm(false)
      fetchEvents()
    } else {
      setMsg('❌ Gagal menyimpan')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus event ini?')) return
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
    if (res.ok) fetchEvents()
  }

  const handleToggle = async (e: Event) => {
    await fetch(`/api/events/${e.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !e.isActive }),
    })
    fetchEvents()
  }

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold' style={{ color: '#023e8a' }}>
            Jadwal Kegiatan
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Kelola event dan jadwal kegiatan kampus
          </p>
        </div>
        <button
          onClick={openAdd}
          className='px-5 py-2.5 rounded-xl text-white text-sm font-medium shadow-sm'
          style={{ background: 'linear-gradient(135deg, #0077b6, #00b4d8)' }}
        >
          + Tambah Event
        </button>
      </div>

      {msg && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
        >
          {msg}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center p-4'
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <div className='w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]'>
            <div className='flex items-center justify-between p-6 border-b'>
              <h2 className='text-lg font-bold' style={{ color: '#023e8a' }}>
                {editId ? 'Edit Event' : 'Tambah Event Baru'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className='text-gray-400 hover:text-gray-600 text-2xl'
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className='p-6 space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Nama Kegiatan *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className='w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2'
                  style={{
                    borderColor: '#d0e8f5',
                  }}
                  placeholder='Seminar Kecerdasan Buatan'
                  required
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Waktu Mulai *
                  </label>
                  <input
                    type='datetime-local'
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({ ...form, startTime: e.target.value })
                    }
                    className='w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none'
                    style={{ borderColor: '#d0e8f5' }}
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Waktu Selesai
                  </label>
                  <input
                    type='datetime-local'
                    value={form.endTime}
                    onChange={(e) =>
                      setForm({ ...form, endTime: e.target.value })
                    }
                    className='w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none'
                    style={{ borderColor: '#d0e8f5' }}
                  />
                </div>
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Lantai *
                  </label>
                  <select
                    value={form.floor}
                    onChange={(e) =>
                      setForm({ ...form, floor: parseInt(e.target.value) })
                    }
                    className='w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none'
                    style={{ borderColor: '#d0e8f5' }}
                  >
                    {[1, 2, 3, 4].map((f) => (
                      <option key={f} value={f}>
                        Lantai {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Ruangan
                  </label>
                  <input
                    value={form.room}
                    onChange={(e) => setForm({ ...form, room: e.target.value })}
                    className='w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none'
                    style={{ borderColor: '#d0e8f5' }}
                    placeholder='Aula Utama / R. 301'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Pelaksana / Penyelenggara
                </label>
                <input
                  value={form.organizer}
                  onChange={(e) =>
                    setForm({ ...form, organizer: e.target.value })
                  }
                  className='w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none'
                  style={{ borderColor: '#d0e8f5' }}
                  placeholder='BEM / Himpunan / Rektorat'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Deskripsi
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className='w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none resize-none'
                  style={{ borderColor: '#d0e8f5' }}
                  rows={3}
                  placeholder='Deskripsi singkat kegiatan...'
                />
              </div>

              <div className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  id='isActive'
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className='w-4 h-4'
                />
                <label htmlFor='isActive' className='text-sm text-gray-700'>
                  Tampilkan di layar (aktif)
                </label>
              </div>

              <div className='flex gap-3 pt-2'>
                <button
                  type='submit'
                  disabled={saving}
                  className='flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-60'
                  style={{
                    background: 'linear-gradient(135deg, #0077b6, #00b4d8)',
                  }}
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type='button'
                  onClick={() => setShowForm(false)}
                  className='px-6 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50'
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
        {loading ? (
          <div className='p-8 text-center text-gray-400'>Memuat...</div>
        ) : events.length === 0 ? (
          <div className='p-8 text-center'>
            <div className='text-4xl mb-3'>📅</div>
            <p className='text-gray-500'>
              Belum ada event. Klik &ldquo;Tambah Event&rdquo; untuk mulai.
            </p>
          </div>
        ) : (
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b' style={{ background: '#f0f7ff' }}>
                <th className='text-left px-4 py-3 text-gray-600 font-medium'>
                  Nama Kegiatan
                </th>
                <th className='text-left px-4 py-3 text-gray-600 font-medium'>
                  Waktu
                </th>
                <th className='text-left px-4 py-3 text-gray-600 font-medium'>
                  Lokasi
                </th>
                <th className='text-left px-4 py-3 text-gray-600 font-medium'>
                  Pelaksana
                </th>
                <th className='text-left px-4 py-3 text-gray-600 font-medium'>
                  Status
                </th>
                <th className='text-left px-4 py-3 text-gray-600 font-medium'>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  className='border-b border-gray-50 hover:bg-gray-50'
                >
                  <td className='px-4 py-3'>
                    <div className='font-medium text-gray-800'>
                      {event.title}
                    </div>
                    {event.description && (
                      <div className='text-gray-400 text-xs mt-0.5 truncate max-w-xs'>
                        {event.description}
                      </div>
                    )}
                  </td>
                  <td className='px-4 py-3 text-gray-600'>
                    <div>
                      {new Intl.DateTimeFormat('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        timeZone: timezone,
                      }).format(new Date(event.startTime))}
                    </div>
                    <div className='text-xs text-gray-400'>
                      {formatTimeInTz(event.startTime, timezone)}{' '}
                      {tzLabel(timezone)}
                      {event.endTime
                        ? ` s/d ${formatTimeInTz(event.endTime, timezone)} ${tzLabel(timezone)}`
                        : ' s/d Selesai'}
                    </div>
                  </td>
                  <td className='px-4 py-3 text-gray-600 text-xs'>
                    <div>Lantai {event.floor}</div>
                    {event.room && (
                      <div className='text-gray-400'>{event.room}</div>
                    )}
                  </td>
                  <td className='px-4 py-3 text-gray-600 text-xs'>
                    {event.organizer ?? '—'}
                  </td>
                  <td className='px-4 py-3'>
                    <button
                      onClick={() => handleToggle(event)}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${event.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {event.isActive ? '● Aktif' : '○ Nonaktif'}
                    </button>
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => openEdit(event)}
                        className='text-xs px-3 py-1 rounded-lg text-white'
                        style={{ background: '#0077b6' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className='text-xs px-3 py-1 rounded-lg text-white'
                        style={{ background: '#c1121f' }}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
