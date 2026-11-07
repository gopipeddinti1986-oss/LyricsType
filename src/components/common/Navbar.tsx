import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Music,
  Keyboard,
  Users,
  BrainCircuit,
  LayoutDashboard,
  Settings,
  Volume2,
  VolumeX,
  Palette,
  Sparkles,
} from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useAudioSound } from '@/context/AudioSoundContext'
import { useAuth } from '@/context/AuthContext'
import type { AppTheme } from '@/types'

export const Navbar: React.FC = () => {
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const { soundEffect, setSoundEffect, soundVolume, setSoundVolume } = useAudioSound()
  const { user, isGuest } = useAuth()
  const [showThemeMenu, setShowThemeMenu] = useState(false)

  const navLinks = [
    { to: '/songs', label: 'Songs', icon: Music },
    { to: '/practice', label: 'Practice', icon: Keyboard },
    { to: '/multiplayer', label: 'Multiplayer', icon: Users, badge: 'Live' },
    { to: '/coach', label: 'AI Coach', icon: BrainCircuit, badge: 'Groq' },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ]

  const themes: { id: AppTheme; label: string; color: string }[] = [
    { id: 'spotify', label: 'Spotify Emerald', color: '#1DB954' },
    { id: 'monkeytype', label: 'Monkeytype Amber', color: '#e2b714' },
    { id: 'cyberpunk', label: 'Cyberpunk Neon', color: '#00f0ff' },
    { id: 'synthwave', label: 'Synthwave Glow', color: '#f72585' },
    { id: 'light', label: 'Solarized Light', color: '#0284c7' },
  ]

  const toggleSound = () => {
    if (soundEffect === 'off') {
      setSoundEffect('mechanical')
      if (soundVolume === 0) setSoundVolume(0.5)
    } else {
      setSoundEffect('off')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--bg-main)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 transition-transform hover:scale-105">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--accent)] to-emerald-400 text-black shadow-lg shadow-[var(--accent-glow)]">
            <Music className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-[var(--text-main)]">
              Lyrics<span className="text-[var(--accent)]">Type</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase text-[var(--text-muted)] font-mono">
              Rhythm & Typing
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname.startsWith(link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--bg-subtle)] text-[var(--accent)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="rounded-full bg-[var(--accent-glow)] px-1.5 py-0.2 text-[10px] font-semibold text-[var(--accent)] border border-[var(--accent)]/30">
                    {link.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2">
          {/* Keyboard Sound Toggle */}
          <button
            onClick={toggleSound}
            title={`Sound FX: ${soundEffect}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text-main)]"
          >
            {soundEffect === 'off' ? (
              <VolumeX className="h-4 w-4 text-[var(--text-muted)]" />
            ) : (
              <Volume2 className="h-4 w-4 text-[var(--accent)]" />
            )}
          </button>

          {/* Theme Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              title="Change Theme"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text-main)]"
            >
              <Palette className="h-4 w-4" />
            </button>

            {showThemeMenu && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2"
                onClick={() => setShowThemeMenu(false)}
              >
                <div className="px-2 py-1 text-xs font-semibold text-[var(--text-muted)]">
                  SELECT THEME
                </div>
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      theme === t.id
                        ? 'bg-[var(--bg-subtle)] text-[var(--accent)]'
                        : 'text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: t.color }}
                      />
                      <span>{t.label}</span>
                    </div>
                    {theme === t.id && <Sparkles className="h-3 w-3 text-[var(--accent)]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <Link
            to="/settings"
            title="Settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text-main)]"
          >
            <Settings className="h-4 w-4" />
          </Link>

          {/* User Profile / Guest Badge */}
          <Link
            to={isGuest ? '/auth/login' : '/profile'}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-1.5 pr-3 transition-colors hover:border-[var(--accent)]"
          >
            <img
              src={user?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=Guest'}
              alt="Avatar"
              className="h-6 w-6 rounded-full bg-[var(--bg-subtle)]"
            />
            <span className="hidden text-xs font-semibold text-[var(--text-main)] sm:inline">
              {user?.username || 'Guest'}
            </span>
            {isGuest && (
              <span className="hidden text-[10px] rounded bg-yellow-500/20 px-1 py-0.5 text-yellow-500 font-mono sm:inline">
                Guest
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
