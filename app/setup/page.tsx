'use client'
import { useEffect, useState } from 'react'

type DbStatus = 'checking' | 'ok' | 'missing' | 'uninitialized' | 'error'

export default function SetupPage() {
  const [status, setStatus] = useState<DbStatus>('checking')
  const [log, setLog] = useState('')
  const [running, setRunning] = useState(false)

  useEffect(() => {
    fetch('/api/setup')
      .then((r) => r.json())
      .then((d) => setStatus(d.status ?? 'error'))
      .catch(() => setStatus('error'))
  }, [])

  async function runMigration() {
    setRunning(true)
    setLog('')
    try {
      const res = await fetch('/api/setup', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setStatus('ok')
        setLog(data.output ?? 'Migration completed.')
      } else {
        setLog(data.output ?? 'Migration failed.')
        setStatus('error')
      }
    } catch (e) {
      setLog(String(e))
      setStatus('error')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className='min-h-screen bg-gray-950 text-white flex items-center justify-center p-8'>
      <div className='max-w-lg w-full bg-gray-900 rounded-2xl shadow-xl p-8 space-y-6'>
        <div className='text-center'>
          <div className='text-4xl mb-3'>🗃️</div>
          <h1 className='text-2xl font-bold'>Database Setup</h1>
          <p className='text-gray-400 text-sm mt-1'>
            CampusBoard — First-time initialization
          </p>
        </div>

        {/* Status Badge */}
        <div className='flex justify-center'>
          {status === 'checking' && (
            <span className='px-4 py-1.5 rounded-full bg-gray-700 text-gray-300 text-sm animate-pulse'>
              ⏳ Checking database...
            </span>
          )}
          {status === 'ok' && (
            <span className='px-4 py-1.5 rounded-full bg-green-800 text-green-200 text-sm'>
              ✅ Database is ready
            </span>
          )}
          {(status === 'missing' || status === 'uninitialized') && (
            <span className='px-4 py-1.5 rounded-full bg-yellow-800 text-yellow-200 text-sm'>
              ⚠️ Database not initialized
            </span>
          )}
          {status === 'error' && (
            <span className='px-4 py-1.5 rounded-full bg-red-800 text-red-200 text-sm'>
              ❌ Error
            </span>
          )}
        </div>

        {/* Message per status */}
        {status === 'ok' && (
          <div className='bg-green-900/30 border border-green-700 rounded-lg p-4 text-sm text-green-200 text-center'>
            Database sudah terkonfigurasi.{' '}
            <a href='/admin' className='underline font-medium'>
              Buka Admin Panel →
            </a>
          </div>
        )}

        {(status === 'missing' || status === 'uninitialized') && (
          <div className='space-y-4'>
            <div className='bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 text-sm text-yellow-200'>
              {status === 'missing'
                ? 'File database SQLite belum ada. Klik tombol di bawah untuk membuat dan menginisialisasi database.'
                : 'File database ditemukan tapi tabel belum dibuat. Klik tombol di bawah untuk menjalankan migrasi.'}
            </div>
            <button
              onClick={runMigration}
              disabled={running}
              className='w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400 rounded-lg font-semibold transition-colors'
            >
              {running ? '⏳ Menginisialisasi...' : '🚀 Inisialisasi Database'}
            </button>
          </div>
        )}

        {status === 'error' && !running && (
          <div className='space-y-3'>
            <div className='bg-red-900/20 border border-red-700 rounded-lg p-4 text-sm text-red-200'>
              Terjadi kesalahan saat memeriksa atau menginisialisasi database.
            </div>
            <button
              onClick={runMigration}
              disabled={running}
              className='w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 rounded-lg font-semibold transition-colors'
            >
              {running ? '⏳ Mencoba ulang...' : '🔄 Coba Lagi'}
            </button>
          </div>
        )}

        {/* Log output */}
        {log && (
          <div className='bg-black/40 border border-gray-700 rounded-lg p-4'>
            <p className='text-xs text-gray-400 mb-2 font-mono'>Output:</p>
            <pre className='text-xs text-gray-300 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto'>
              {log}
            </pre>
            {status === 'ok' && (
              <div className='mt-3 text-center'>
                <a
                  href='/admin'
                  className='inline-block px-5 py-2 bg-green-700 hover:bg-green-600 rounded-lg text-sm font-semibold transition-colors'
                >
                  Buka Admin Panel →
                </a>
              </div>
            )}
          </div>
        )}

        <p className='text-center text-xs text-gray-600'>
          Halaman ini hanya untuk inisialisasi pertama kali.
        </p>
      </div>
    </div>
  )
}
