import React, { useState } from 'react'
import {
  Palette,
  Volume2,
  Type,
  Eye,
  Sliders,
  Check,
  Play,
  RotateCcw,
} from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useAudioSound } from '@/context/AudioSoundContext'
import type { AppTheme, KeyboardSound, UserPreferences } from '@/types'

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, fontSize, setFontSize, distractionFree, setDistractionFree } = useTheme()
  const { soundEffect, setSoundEffect, soundVolume, setSoundVolume, playKeySound } = useAudioSound()
  const [testText, setTestText] = useState('')

  const themes: { id: AppTheme; label: string; desc: string; color: string }[] = [
    { id: 'spotify', label: 'Spotify Emerald', desc: 'Dark charcoal with Spotify green accents', color: '#1DB954' },
    { id: 'monkeytype', label: 'Monkeytype Amber', desc: 'Minimalist pitch dark with warm yellow accents', color: '#e2b714' },
    { id: 'cyberpunk', label: 'Cyberpunk Neon', desc: 'High-contrast cyan and electric magenta glow', color: '#00f0ff' },
    { id: 'synthwave', label: 'Synthwave Night', desc: 'Deep violet gradient with retro neon pink', color: '#f72585' },
    { id: 'light', label: 'Solarized Clean', desc: 'High legibility clean light canvas', color: '#0284c7' },
  ]

  const sounds: { id: KeyboardSound; label: string; desc: string }[] = [
    { id: 'mechanical', label: 'Cherry MX Blue', desc: 'Crisp tactile switch click' },
    { id: 'thock', label: 'Linear Thock', desc: 'Deep, lubed mechanical bottom-out sound' },
    { id: 'typewriter', label: 'Vintage Typewriter', desc: 'Metallic striker sound effect' },
    { id: 'beep', label: 'Arcade Blip', desc: 'Soft synthesized 8-bit blip' },
    { id: 'off', label: 'Muted', desc: 'Completely silent keystrokes' },
  ]

  const fontSizes: { id: UserPreferences['fontSize']; label: string }[] = [
    { id: 'small', label: 'Compact' },
    { id: 'medium', label: 'Standard (Default)' },
    { id: 'large', label: 'Large' },
    { id: 'huge', label: 'Extra Large' },
  ]

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-main)]">Settings & Customization</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Tailor your visual theme, mechanical switch sound effects, and typing environment.
        </p>
      </div>

      {/* Theme Picker */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-5 w-5 text-[var(--accent)]" />
          <h3 className="text-base font-bold text-[var(--text-main)]">Visual Theme</h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {themes.map((t) => (
            <div
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
                theme === t.id
                  ? 'border-[var(--accent)] bg-[var(--bg-subtle)] shadow-md shadow-[var(--accent-glow)]'
                  : 'border-[var(--border)] bg-[var(--bg-main)] hover:border-[var(--accent)]/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-5 w-5 rounded-full shadow-inner"
                  style={{ backgroundColor: t.color }}
                />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[var(--text-main)]">{t.label}</h4>
                  <p className="text-[11px] text-[var(--text-muted)]">{t.desc}</p>
                </div>
              </div>
              {theme === t.id && <Check className="h-4 w-4 text-[var(--accent)]" />}
            </div>
          ))}
        </div>
      </div>

      {/* Audio & Sound Effects */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Volume2 className="h-5 w-5 text-[var(--accent)]" />
          <h3 className="text-base font-bold text-[var(--text-main)]">Keyboard Sound Effects</h3>
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {sounds.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSoundEffect(s.id)
                  playKeySound()
                }}
                className={`flex flex-col rounded-2xl border p-4 text-left transition-all ${
                  soundEffect === s.id
                    ? 'border-[var(--accent)] bg-[var(--bg-subtle)]'
                    : 'border-[var(--border)] bg-[var(--bg-main)] hover:border-[var(--accent)]/50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs text-[var(--text-main)]">{s.label}</span>
                  {soundEffect === s.id && <Check className="h-3.5 w-3.5 text-[var(--accent)]" />}
                </div>
                <span className="text-[10px] text-[var(--text-muted)] mt-1">{s.desc}</span>
              </button>
            ))}
          </div>

          {/* Volume Slider */}
          <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-main)] p-4">
            <div className="text-xs">
              <div className="font-bold text-[var(--text-main)]">Sound Volume</div>
              <div className="text-[10px] text-[var(--text-muted)]">Adjust keystroke click volume</div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(soundVolume * 100)}
                onChange={(e) => {
                  setSoundVolume(parseInt(e.target.value, 10) / 100)
                  playKeySound()
                }}
                className="h-1.5 w-32 cursor-pointer appearance-none rounded-lg bg-[var(--bg-subtle)] accent-[var(--accent)]"
              />
              <span className="font-mono text-xs w-8 text-right font-bold text-[var(--text-main)]">
                {Math.round(soundVolume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Font Size & Distraction Free Mode */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Type className="h-5 w-5 text-[var(--accent)]" />
          <h3 className="text-base font-bold text-[var(--text-main)]">Typography & Focus</h3>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs">
              <div className="font-bold text-[var(--text-main)]">Lyrics Font Size</div>
              <div className="text-[10px] text-[var(--text-muted)]">Scale lyric characters for readability</div>
            </div>
            <div className="flex rounded-xl bg-[var(--bg-subtle)] p-1 text-xs">
              {fontSizes.map((fs) => (
                <button
                  key={fs.id}
                  onClick={() => setFontSize(fs.id)}
                  className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                    fontSize === fs.id
                      ? 'bg-[var(--accent)] text-black font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {fs.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
            <div className="text-xs">
              <div className="font-bold text-[var(--text-main)]">Distraction-Free Mode</div>
              <div className="text-[10px] text-[var(--text-muted)]">Hide extraneous UI elements during typing</div>
            </div>
            <button
              onClick={() => setDistractionFree(!distractionFree)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                distractionFree ? 'bg-[var(--accent)]' : 'bg-[var(--bg-subtle)]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                  distractionFree ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Sound & Font Live Test Box */}
      <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--bg-main)] p-6 text-center">
        <span className="text-xs font-mono uppercase text-[var(--text-muted)]">
          LIVE INTERACTIVE TEST BENCH
        </span>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Type inside this box to hear your selected switch sounds and inspect typography:
        </p>
        <input
          type="text"
          value={testText}
          onChange={(e) => {
            setTestText(e.target.value)
            playKeySound()
          }}
          placeholder="The quick brown fox jumps over the lazy dog..."
          className="mt-4 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 text-center font-mono text-lg text-[var(--accent)] focus:border-[var(--accent)] focus:outline-none"
        />
      </div>
    </div>
  )
}
