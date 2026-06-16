// pages/Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/')
    } catch {
      toast.error('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-blue-600 items-center justify-center text-3xl mb-4 shadow-lg">🏬</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Market</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Charge Collection Manager</p>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Developed by Dayansh Kuroliya</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Sign in to your account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                className="input"
                placeholder="admin"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-2.5">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <p className="text-xs text-center text-gray-400 mt-6">
            Default credentials: <span className="font-mono font-medium">admin / admin123</span>
          </p>
        </div>
      </div>
    </div>
  )
}
