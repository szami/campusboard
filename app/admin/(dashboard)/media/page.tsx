'use client'
import { useEffect, useRef, useState } from 'react'

interface Media {
  id: string
  type: string
  url: string
  title?: string | null
  displayOrder: number
  duration: number
  isActive: boolean
  objectFit: string
}

const EMPTY_FORM = {
  type: 'YOUTUBE',
  url: '',
  title: '',
  displayOrder: 0,
  duration: 10,
  isActive: true,
  objectFit: 'contain',
}

const TYPE_LABELS: Record<string, string> = {
  YOUTUBE: '🎥 YouTube',
  LOCAL: '💾 File Lokal',
  EXTERNAL: '🌐 URL Eksternal',
}

export default function MediaPage() {
  const [items, setItems] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchMedia = async () => {
    const res = await fetch('/api/media')
    if (res.ok) setItems(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    fetchMedia()
  }, [])

  const openAdd = () => {
    setEditId(null)
    setForm({ ...EMPTY_FORM })
    setShowForm(true)
    setMsg('')
  }
  const openEdit = (m: Media) => {
    setEditId(m.id)
    setForm({
      type: m.type,
      url: m.url,
      title: m.title ?? '',
      displayOrder: m.displayOrder,
      duration: m.duration,
      isActive: m.isActive,
      objectFit: m.objectFit ?? 'contain',
    })
    setShowForm(true)
    setMsg('')
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (res.ok) {
      const data = await res.json()
      setForm((f) => ({ ...f, url: data.url, type: 'LOCAL' }))
    } else {
      setMsg('❌ Upload gagal')
    }
    setUploading(false)
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setSaving(true)
    const url = editId ? `/api/media/${editId}` : '/api/media'
    const method = editId ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setMsg('✅ Disimpan')
      setShowForm(false)
      fetchMedia()
    } else setMsg('❌ Gagal')
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus media ini?')) return
    await fetch(`/api/media/${id}`, { method: 'DELETE' })
    fetchMedia()
  }

  const handleToggle = async (m: Media) => {
    await fetch(`/api/media/${m.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !m.isActive }),
    })
    fetchMedia()
  }

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold' style={{ color: '#023e8a' }}>
            Manajemen Media
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Kelola video dan gambar untuk ditampilkan di layar
          </p>
        </div>
        <button
          onClick={openAdd}
          className='px-5 py-2.5 rounded-xl text-white text-sm font-medium shadow-sm'
          style={{ background: 'linear-gradient(135deg, #0077b6, #00b4d8)' }}
        >
          + Tambah Media
        </button>
      </div>

      {msg && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
        >
          {msg}
        </div>
      )}

      {/* Tips */}
      <div className='mb-4 px-4 py-3 rounded-xl text-sm bg-blue-50 text-blue-700 border border-blue-200'>
        💡 <strong>Tips:</strong> Video YouTube akan diputar otomatis dan
        berulang. Gambar akan berganti tiap beberapa detik sesuai durasi yang
        diatur. Urutan tampil sesuai dengan nilai "Urutan Tampil" (angka kecil =
        tampil lebih dulu).
      </div>

      {/* Modal Form */}
      {showForm && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center p-4'
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <div className='w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]'>
            <div className='flex items-center justify-between p-6 border-b'>
              <h2 className='text-lg font-bold' style={{ color: '#023e8a' }}>
                {editId ? 'Edit Media' : 'Tambah Media'}
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
                  Tipe Media
                </label>
                <div className='grid grid-cols-3 gap-2'>
                  {Object.entries(TYPE_LABELS).map(([val, lbl]) => (
                    <button
                      key={val}
                      type='button'
                      onClick={() => setForm({ ...form, type: val, url: '' })}
                      className='py-2 rounded-xl text-xs font-medium border transition-all'
                      style={{
                        background:
                          form.type === val
                            ? 'rgba(0,119,182,0.15)'
                            : 'transparent',
                        borderColor: form.type === val ? '#0077b6' : '#e5e7eb',
                        color: form.type === val ? '#0077b6' : '#6b7280',
                      }}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {form.type === 'LOCAL' ? (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Upload File
                  </label>
                  <div className='flex gap-2'>
                    <input
                      type='text'
                      readOnly
                      value={form.url}
                      placeholder='/uploads/filename.jpg'
                      className='flex-1 border rounded-xl px-3 py-2 text-sm bg-gray-50'
                      style={{ borderColor: '#d0e8f5' }}
                    />
                    <button
                      type='button'
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className='px-4 py-2 rounded-xl text-sm text-white'
                      style={{ background: '#0077b6' }}
                    >
                      {uploading ? '⏳' : '📁 Pilih'}
                    </button>
                  </div>
                  <input
                    ref={fileRef}
                    type='file'
                    className='hidden'
                    accept='image/*,video/*'
                    onChange={handleUpload}
                  />
                  <p className='text-xs text-gray-400 mt-1'>
                    Format: JPG, PNG, GIF, WebP, MP4, WebM. Maks 50MB
                  </p>
                </div>
              ) : (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {form.type === 'YOUTUBE' ? 'URL YouTube' : 'URL Media'}
                  </label>
                  <input
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    className='w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none'
                    style={{ borderColor: '#d0e8f5' }}
                    placeholder={
                      form.type === 'YOUTUBE'
                        ? 'https://www.youtube.com/watch?v=...'
                        : 'https://example.com/image.jpg'
                    }
                    required
                  />
                </div>
              )}

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Judul (opsional)
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className='w-full border rounded-xl px-4 py-2.5 text-sm'
                  style={{ borderColor: '#d0e8f5' }}
                  placeholder='Judul media yang ditampilkan'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Urutan Tampil
                  </label>
                  <input
                    type='number'
                    value={form.displayOrder}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        displayOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className='w-full border rounded-xl px-4 py-2.5 text-sm'
                    style={{ borderColor: '#d0e8f5' }}
                    min={0}
                  />
                </div>
                {form.type !== 'YOUTUBE' && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Durasi Tampil (detik)
                    </label>
                    <input
                      type='number'
                      value={form.duration}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          duration: parseInt(e.target.value) || 10,
                        })
                      }
                      className='w-full border rounded-xl px-4 py-2.5 text-sm'
                      style={{ borderColor: '#d0e8f5' }}
                      min={3}
                      max={120}
                    />
                  </div>
                )}
              </div>

              {/* objectFit toggle — only for image media */}
              {form.type !== 'YOUTUBE' &&
                !form.url.match(/\.(mp4|webm|ogg)$/i) && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Tampilan Gambar
                    </label>
                    <div className='grid grid-cols-2 gap-2'>
                      {[
                        {
                          val: 'contain',
                          label: '🔲 Normal (Contain)',
                          desc: 'Gambar penuh terlihat, ada border hitam',
                        },
                        {
                          val: 'cover',
                          label: '🖼️ Stretch (Cover)',
                          desc: 'Gambar memenuhi layar, mungkin terpotong',
                        },
                      ].map(({ val, label, desc }) => (
                        <button
                          key={val}
                          type='button'
                          onClick={() => setForm({ ...form, objectFit: val })}
                          className='py-2 px-3 rounded-xl text-xs font-medium border transition-all text-left'
                          style={{
                            background:
                              form.objectFit === val
                                ? 'rgba(0,119,182,0.15)'
                                : 'transparent',
                            borderColor:
                              form.objectFit === val ? '#0077b6' : '#e5e7eb',
                            color:
                              form.objectFit === val ? '#0077b6' : '#6b7280',
                          }}
                        >
                          <div>{label}</div>
                          <div className='text-xs mt-0.5 opacity-70'>
                            {desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              <div className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  id='mediaActive'
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className='w-4 h-4'
                />
                <label htmlFor='mediaActive' className='text-sm text-gray-700'>
                  Aktifkan media ini
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

      {/* Media Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {loading ? (
          <div className='col-span-3 p-8 text-center text-gray-400'>
            Memuat...
          </div>
        ) : items.length === 0 ? (
          <div className='col-span-3 p-8 text-center'>
            <div className='text-4xl mb-3'>🎬</div>
            <p className='text-gray-500'>
              Belum ada media. Tambahkan video atau gambar.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
            >
              <div className='p-4'>
                <div className='flex items-start justify-between mb-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-lg'>
                      {item.type === 'YOUTUBE'
                        ? '🎥'
                        : item.type === 'LOCAL'
                          ? '💾'
                          : '🌐'}
                    </span>
                    <span className='text-xs font-medium text-gray-500 uppercase'>
                      {item.type}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggle(item)}
                    className={`text-xs px-2 py-1 rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {item.isActive ? '● Aktif' : '○ Off'}
                  </button>
                </div>
                <div className='font-medium text-gray-800 text-sm mb-1'>
                  {item.title ?? '(tanpa judul)'}
                </div>
                <div className='text-xs text-gray-400 truncate mb-3'>
                  {item.url}
                </div>
                <div className='flex items-center gap-3 text-xs text-gray-500 mb-3'>
                  <span>Urutan: {item.displayOrder}</span>
                  {item.type !== 'YOUTUBE' && (
                    <span>Durasi: {item.duration}s</span>
                  )}
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => openEdit(item)}
                    className='flex-1 py-1.5 rounded-lg text-white text-xs'
                    style={{ background: '#0077b6' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className='flex-1 py-1.5 rounded-lg text-white text-xs'
                    style={{ background: '#c1121f' }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
