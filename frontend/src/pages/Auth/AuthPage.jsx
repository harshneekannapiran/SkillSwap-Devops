import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiClient } from '../../services/apiClient.js'

export function AuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') || 'login')
  const [role, setRole] = useState('student')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const modeFromUrl = searchParams.get('mode')
    if (modeFromUrl && modeFromUrl !== mode) {
      setMode(modeFromUrl)
      setError('')
      setSuccess('')
    }
  }, [searchParams])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'register') {
        const { data } = await apiClient.post('/api/auth/register', {
          name: form.name,
          email: form.email,
          password: form.password,
          role,
        })
        localStorage.setItem('skillswap_token', data.access_token)
        localStorage.setItem('skillswap_user', JSON.stringify(data.user))
        setSuccess('Registration successful. Redirecting to dashboard...')
        navigate('/dashboard', { replace: true })
      } else {
        const { data } = await apiClient.post('/api/auth/login', {
          email: form.email,
          password: form.password,
        })
        localStorage.setItem('skillswap_token', data.access_token)
        localStorage.setItem('skillswap_user', JSON.stringify(data.user))
        setSuccess('Login successful. Redirecting to dashboard...')
        navigate('/dashboard', { replace: true })
      }
    } catch (error) {
      console.error('Authentication error:', error)
      setError(error.response?.data?.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center px-6 overflow-hidden">
      <div className="w-full max-w-md">
        {/* SkillSwap Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary text-white text-2xl font-bold shadow-lg">
            S
          </div>
          <h1 className="mt-3 text-3xl font-bold text-text-primary">
            Skill<span className="text-primary">Swap</span>
          </h1>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xl max-w-sm mx-auto">
          {/* Toggle Buttons */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}
              className={`w-1/2 px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                mode === 'login'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccess('') }}
              className={`w-1/2 px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                mode === 'register'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2 focus:border-primary"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2 focus:border-primary"
                placeholder="john@example.com"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">
                  I am a
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={role === 'student'}
                      onChange={(e) => setRole(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-text-secondary">Student</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="alumni"
                      checked={role === 'alumni'}
                      onChange={(e) => setRole(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-text-secondary">Alumni</span>
                  </label>
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2 focus:border-primary"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-card shadow-sm transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Please wait...' : (mode === 'register' ? 'Create Account' : 'Sign In')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
