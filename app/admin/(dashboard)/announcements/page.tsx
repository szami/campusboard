'use client'
import { useEffect, useState } from 'react'

interface Announcement {
  id: string
  text: string
  priority: number
  isActive: boolean
  createdAt: string
}

const EMPTY_FORM = { text: '', priority: 0, isActive: true }

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const fetchData = async () => {
    const res = await fetch('/api/announcements')
    if (res.ok) setItems(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openAdd = () => {
    setEditId(null)
    setForm({ ...EMPTY_FORM })
    setShowForm(true)
    setMsg('')
  }
  const openEdit = (a: Announcement) => {
    setEditId(a.id)
    setForm({ text: a.text, priority: a.priority, isActive: a.isActive })
    setShowForm(true)
    setMsg('')
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setSaving(true)
    const url = editId ? `/api/announcements/${editId}` : '/api/announcements'
    const method = editId ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setMsg('✅ Disimpan')
      setShowForm(false)
      fetchData()
    } else setMsg('❌ Gagal')
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pengumuman ini?')) return
    await fetch(`/api/announcements/${id}`, { method: 'DELETE' })
    fetchData()
  }

  const handleToggle = async (a: Announcement) => {
    await fetch(`/api/announcements/${a.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !a.isActive }),
    })
    fetchData()
  }

  const sorted = [...items].sort((a, b) => b.priority - a.priority)

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold' style={{ color: '#023e8a' }}>
            Manajemen Pengumuman
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Kelola teks berjalan (marquee) di bagian bawah layar
          </p>
        </div>
        <button
          onClick={openAdd}
          className='px-5 py-2.5 rounded-xl text-white text-sm font-medium shadow-sm'
          style={{ background: 'linear-gradient(135deg, #0077b6, #00b4d8)' }}
        >
          + Tambah Pengumuman
        </button>
      </div>

      {msg && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
        >
          {msg}
        </div>
      )}

      {/* Preview Marquee */}
      {items.filter((a) => a.isActive).length > 0 && (
        <div
          className='mb-6 rounded-2xl overflow-hidden shadow-sm'
          style={{ background: '#03045e' }}
        >
          <div
            className='px-4 py-2 text-xs font-medium'
            style={{ background: '#023e8a', color: '#90e0ef' }}
          >
            Preview Teks Berjalan
          </div>
          <div className='overflow-hidden py-3 px-4'>
            <div className='text-white text-sm flex gap-8 whitespace-nowrap'>
              📢 INFO &nbsp;|&nbsp;{' '}
              {items
                .filter((a) => a.isActive)
                .sort((a, b) => b.priority - a.priority)
                .map((a) => a.text)
                .join(' ✦ ')}
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center p-4'
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <div className='w-full max-w-lg bg-white rounded-2xl shadow-2xl'>
            <div className='flex items-center justify-between p-6 border-b'>
              <h2 className='text-lg font-bold' style={{ color: '#023e8a' }}>
                {editId ? 'Edit Pengumuman' : 'Tambah Pengumuman'}
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
                  Teks Pengumuman *
                </label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  rows={3}
                  className='w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none resize-none'
                  style={{ borderColor: '#d0e8f5' }}
                  placeholder='Tulis isi pengumuman di sini...'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Prioritas (angka lebih besar = tampil lebih awal)
                </label>
                <input
                  type='number'
                  value={form.priority}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      priority: parseInt(e.target.value) || 0,
                    })
                  }
                  className='w-full border rounded-xl px-4 py-2.5 text-sm'
                  style={{ borderColor: '#d0e8f5' }}
                  min={0}
                />
              </div>
              <div className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  id='annActive'
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className='w-4 h-4'
                />
                <label htmlFor='annActive' className='text-sm text-gray-700'>
                  Aktifkan pengumuman ini
                </label>
              </div>
              <div className='flex gap-3 pt-2'>
                <button
                  type='submit'
                  disabled={saving}
                  className='flex-1 py-2.5 rounded-xl text-white text-sm font-medium'
                  style={{
                    background: 'linear-gradient(135deg, #0077b6, #00b4d8)',
                  }}
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type='button'
                  onClick={() => setShowForm(false)}
                  className='px-6 py-2.5 rounded-xl text-sm border text-gray-600'
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
        <table className='w-full text-sm'>
          <thead>
            <tr style={{ background: 'rgba(0,119,182,0.05)' }}>
              <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>
                Teks
              </th>
              <th className='text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-24'>
                Prioritas
              </th>
              <th className='text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-24'>
                Status
              </th>
              <th className='text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-28'>
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-50'>
            {loading ? (
              <tr>
                <td colSpan={4} className='text-center py-8 text-gray-400'>
                  Memuat...
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={4} className='text-center py-12'>
                  <div className='text-4xl mb-3'>📢</div>
                  <p className='text-gray-500'>Belum ada pengumuman.</p>
                </td>
              </tr>
            ) : (
              sorted.map((a) => (
                <tr
                  key={a.id}
                  className={`hover:bg-gray-50 transition-colors ${!a.isActive ? 'opacity-50' : ''}`}
                >
                  <td className='px-4 py-3 text-gray-800'>{a.text}</td>
                  <td className='px-4 py-3 text-center'>
                    <span className='text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600'>
                      {a.priority}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-center'>
                    <button
                      onClick={() => handleToggle(a)}
                      className={`text-xs px-3 py-1 rounded-full ${a.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {a.isActive ? 'Aktif' : 'Off'}
                    </button>
                  </td>
                  <td className='px-4 py-3 text-center'>
                    <div className='flex justify-center gap-2'>
                      <button
                        onClick={() => openEdit(a)}
                        className='text-xs px-3 py-1 rounded-lg text-white'
                        style={{ background: '#0077b6' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className='text-xs px-3 py-1 rounded-lg text-white'
                        style={{ background: '#c1121f' }}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
