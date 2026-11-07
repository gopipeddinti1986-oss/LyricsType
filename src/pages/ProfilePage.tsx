import React, { useState } from 'react'
import {
  User,
  Award,
  Clock,
  Zap,
  Target,
  Edit2,
  Check,
  Music,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { loadStoredSessions } from '@/lib/storage'

export const ProfilePage: React.FC = () => {
  const { user, isGuest, updateProfile, signOut } = useAuth()
  const sessions = loadStoredSessions()

  const [isEditing, setIsEditing] = useState(false)
  const [usernameInput, setUsernameInput] = useState(user?.username || '')
  const [bioInput, setBioInput] = useState(user?.bio || '')

  const bestWpm = sessions.length > 0 ? Math.max(...sessions.map((s) => s.metrics.netWpm)) : 0
  const avgWpm = sessions.length > 0 ? Math.round(sessions.reduce((a, b) => a + b.metrics.netWpm, 0) / sessions.length) : 0

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateProfile({
      username: usernameInput,
      bio: bioInput,
    })
    setIsEditing(false)
  }

  const badges = [
    { title: 'First Beat', desc: 'Completed your first music typing session', unlocked: sessions.length >= 1 },
    { title: 'Speed Demon', desc: 'Surpassed 75 Net WPM on any track', unlocked: bestWpm >= 75 },
    { title: 'Century Club', desc: 'Broken 100+ Net WPM threshold', unlocked: bestWpm >= 100 },
    { title: 'Melody Veteran', desc: 'Practiced 10+ songs on LyricsType', unlocked: sessions.length >= 10 },
  ]

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-r from-[var(--bg-card)] to-[var(--bg-subtle)] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={user?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=Profile'}
              alt="Avatar"
              className="h-20 w-20 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[var(--text-main)]">
                  {user?.username || 'Typist'}
                </h1>
                {isGuest && (
                  <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-mono text-yellow-500 border border-yellow-500/20">
                    Guest Account
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{user?.email}</p>
              <p className="mt-2 text-xs text-[var(--text-main)]/90 italic">
                "{user?.bio || 'Music and typing enthusiast.'}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-xs font-semibold text-[var(--text-main)] hover:border-[var(--accent)]"
            >
              <Edit2 className="h-4 w-4 text-[var(--accent)]" />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>

            <button
              onClick={signOut}
              className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <form onSubmit={handleSave} className="mt-6 border-t border-[var(--border)] pt-6 flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)]">Username:</label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-2.5 text-xs text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-muted)]">Bio:</label>
              <input
                type="text"
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-2.5 text-xs text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="self-end rounded-xl bg-[var(--accent)] px-5 py-2 text-xs font-bold text-black"
            >
              Save Changes
            </button>
          </form>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 text-center">
          <div className="text-xs text-[var(--text-muted)] font-mono">RECORD WPM</div>
          <div className="mt-2 text-3xl font-extrabold font-mono text-[var(--accent)]">{bestWpm}</div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 text-center">
          <div className="text-xs text-[var(--text-muted)] font-mono">AVG WPM</div>
          <div className="mt-2 text-3xl font-extrabold font-mono text-emerald-400">{avgWpm}</div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 text-center">
          <div className="text-xs text-[var(--text-muted)] font-mono">TOTAL SESSIONS</div>
          <div className="mt-2 text-3xl font-extrabold font-mono text-blue-400">{sessions.length}</div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 text-center">
          <div className="text-xs text-[var(--text-muted)] font-mono">COMMUNITY RANK</div>
          <div className="mt-2 text-3xl font-extrabold font-mono text-purple-400">#42</div>
        </div>
      </div>

      {/* Achievements / Badges */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <Award className="h-5 w-5 text-[var(--accent)]" />
          <h3 className="text-lg font-bold text-[var(--text-main)]">
            Achievements & Badges
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {badges.map((b, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 rounded-2xl border p-4 transition-all ${
                b.unlocked
                  ? 'border-[var(--accent)]/40 bg-[var(--accent-glow)] text-[var(--text-main)]'
                  : 'border-[var(--border)] bg-[var(--bg-subtle)] opacity-40'
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-card)] text-[var(--accent)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">{b.title}</h4>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{b.desc}</p>
                <span className="mt-2 inline-block text-[10px] font-mono font-bold uppercase">
                  {b.unlocked ? '✓ Unlocked' : 'Locked'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
