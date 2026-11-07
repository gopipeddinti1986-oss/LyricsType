import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Music,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { isSupabaseConfigured } from '@/lib/supabase'

export const AuthPage: React.FC = () => {
  const navigate = useNavigate()
  const { signInWithEmail, signUpWithEmail, continueAsGuest } = useAuth()

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signInWithEmail(email, password)
      if (error) {
        setErrorMessage(error.message)
      } else {
        navigate('/dashboard')
      }
    } else if (mode === 'register') {
      const { error } = await signUpWithEmail(email, password, username)
      if (error) {
        setErrorMessage(error.message)
      } else {
        setSuccessMessage('Registration successful! Please check your email or proceed.')
        setTimeout(() => navigate('/dashboard'), 1500)
      }
    } else {
      setSuccessMessage('Password reset instructions sent if email exists.')
    }

    setLoading(false)
  }

  const handleGuest = () => {
    continueAsGuest()
    navigate('/songs')
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center py-8">
      <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-2xl">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-emerald-400 text-black shadow-lg shadow-[var(--accent-glow)]">
            <Music className="h-6 w-6 stroke-[2.5]" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-[var(--text-main)]">
            {mode === 'login' && 'Welcome to LyricsType'}
            {mode === 'register' && 'Create Your Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Synchronize your typing speed with music.
          </p>
        </div>

        {/* Notices */}
        {!isSupabaseConfigured && (
          <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-blue-500/10 p-3.5 text-xs text-blue-400 border border-blue-500/20">
            <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Cloud auth is in local sandbox/offline mode. You can continue as Guest or test accounts locally.
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-400 border border-red-500/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)]">Username:</label>
              <div className="relative mt-1">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="RhythmMaster"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] py-2.5 pl-10 pr-4 text-xs text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-[var(--text-muted)]">Email Address:</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] py-2.5 pl-10 pr-4 text-xs text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)]">Password:</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] py-2.5 pl-10 pr-4 text-xs text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] py-3 text-sm font-bold text-black shadow-lg shadow-[var(--accent-glow)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <span>
              {mode === 'login' && 'Sign In'}
              {mode === 'register' && 'Create Account'}
              {mode === 'forgot' && 'Send Reset Link'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Guest Mode Direct Access */}
        <div className="mt-6 flex flex-col items-center gap-4 border-t border-[var(--border)] pt-6">
          <button
            onClick={handleGuest}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] py-2.5 text-xs font-semibold text-[var(--text-main)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
          >
            Instant Play as Guest (No Registration Needed)
          </button>

          {/* Toggle mode links */}
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
            {mode === 'login' ? (
              <>
                <button
                  onClick={() => setMode('register')}
                  className="hover:text-[var(--accent)]"
                >
                  Don't have an account? Sign up
                </button>
                <span>•</span>
                <button
                  onClick={() => setMode('forgot')}
                  className="hover:text-[var(--text-main)]"
                >
                  Forgot password?
                </button>
              </>
            ) : (
              <button
                onClick={() => setMode('login')}
                className="hover:text-[var(--accent)]"
              >
                Already have an account? Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
