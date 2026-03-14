'use client'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Username atau password salah')
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div
      className='min-h-screen flex items-center justify-center'
      style={{
        background: 'linear-gradient(135deg, #03045e 0%, #023e8a 100%)',
      }}
    >
      <div
        className='w-full max-w-md p-8 rounded-2xl shadow-2xl'
        style={{
          background: 'rgba(2,62,138,0.85)',
          border: '1px solid rgba(0,180,216,0.3)',
        }}
      >
        {/* Logo */}
        <div className='text-center mb-8'>
          <div className='text-5xl mb-3'>🎓</div>
          <h1 className='text-2xl font-bold text-white'>CampusBoard</h1>
          <p className='text-sm mt-1' style={{ color: '#90e0ef' }}>
            Admin Dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label
              className='block text-sm font-medium mb-1'
              style={{ color: '#ade8f4' }}
            >
              Username
            </label>
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='w-full px-4 py-3 rounded-xl text-white placeholder-gray-400 outline-none focus:ring-2'
              style={
                {
                  background: 'rgba(0,119,182,0.3)',
                  border: '1px solid rgba(0,180,216,0.3)',
                  focusRingColor: '#00b4d8',
                } as any
              }
              placeholder='admin'
              required
              autoComplete='username'
            />
          </div>
          <div>
            <label
              className='block text-sm font-medium mb-1'
              style={{ color: '#ade8f4' }}
            >
              Password
            </label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full px-4 py-3 rounded-xl text-white placeholder-gray-400 outline-none focus:ring-2'
              style={
                {
                  background: 'rgba(0,119,182,0.3)',
                  border: '1px solid rgba(0,180,216,0.3)',
                } as any
              }
              placeholder='••••••••'
              required
              autoComplete='current-password'
            />
          </div>

          {error && (
            <div
              className='px-4 py-3 rounded-xl text-sm'
              style={{
                background: 'rgba(193,18,31,0.2)',
                border: '1px solid rgba(193,18,31,0.4)',
                color: '#ff6b6b',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <button
            type='submit'
            disabled={loading}
            className='w-full py-3 rounded-xl font-bold text-white transition-all text-sm disabled:opacity-60'
            style={{
              background: loading
                ? 'rgba(0,150,199,0.5)'
                : 'linear-gradient(135deg, #0077b6, #00b4d8)',
            }}
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <p className='text-center text-xs mt-6' style={{ color: '#90e0ef' }}>
          &copy; {new Date().getFullYear()} CampusBoard
        </p>
      </div>
    </div>
  )
}
