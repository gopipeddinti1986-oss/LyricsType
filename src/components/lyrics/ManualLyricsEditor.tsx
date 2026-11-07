import React, { useState } from 'react'
import {
  FileText,
  Clock,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles,
  Languages,
} from 'lucide-react'
import type { LyricSegment } from '@/types'
import { parseLrc, parsePlainTextLyrics, formatTimestamp, exportToLrc } from '@/lib/lyricsParser'

interface ManualLyricsEditorProps {
  currentPlaybackTime: number
  songDuration: number
  initialLyrics?: LyricSegment[]
  onApplyLyrics: (segments: LyricSegment[], language: string) => void
  onClose?: () => void
}

export const ManualLyricsEditor: React.FC<ManualLyricsEditorProps> = ({
  currentPlaybackTime,
  songDuration,
  initialLyrics = [],
  onApplyLyrics,
  onClose,
}) => {
  const [rawText, setRawText] = useState(() =>
    initialLyrics.length > 0 ? exportToLrc(initialLyrics) : ''
  )
  const [language, setLanguage] = useState('English')
  const [parsedSegments, setParsedSegments] = useState<LyricSegment[]>(initialLyrics)
  const [activeSyncIndex, setActiveSyncIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'text' | 'sync' | 'preview'>('text')

  const handleParse = () => {
    // Check if user entered LRC format or plain lines
    if (rawText.includes('[') && rawText.includes(']')) {
      const segs = parseLrc(rawText)
      setParsedSegments(segs)
    } else {
      const segs = parsePlainTextLyrics(rawText, songDuration || 180)
      setParsedSegments(segs)
    }
    setActiveTab('sync')
  }

  // Stamp current playback time to the active line
  const stampTime = () => {
    if (activeSyncIndex >= parsedSegments.length) return

    setParsedSegments((prev) => {
      const updated = [...prev]
      const current = { ...updated[activeSyncIndex], time: parseFloat(currentPlaybackTime.toFixed(2)) }
      updated[activeSyncIndex] = current

      // Set previous line's endTime
      if (activeSyncIndex > 0) {
        updated[activeSyncIndex - 1].endTime = current.time
      }
      return updated
    })

    if (activeSyncIndex < parsedSegments.length - 1) {
      setActiveSyncIndex((i) => i + 1)
    }
  }

  const resetSync = () => {
    setActiveSyncIndex(0)
  }

  const handleSave = () => {
    onApplyLyrics(parsedSegments, language)
    onClose?.()
  }

  const languagesList = [
    'English',
    'Telugu',
    'Hindi',
    'Spanish',
    'Japanese',
    'Korean',
    'French',
    'German',
    'Tamil',
  ]

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-2.5">
          <FileText className="h-5 w-5 text-[var(--accent)]" />
          <h3 className="text-lg font-bold text-[var(--text-main)]">
            Lyrics & Timestamp Studio
          </h3>
        </div>

        {/* Tab switchers */}
        <div className="flex rounded-xl bg-[var(--bg-subtle)] p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('text')}
            className={`rounded-lg px-3 py-1 transition-colors ${
              activeTab === 'text'
                ? 'bg-[var(--accent)] text-black'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            1. Paste Lyrics
          </button>
          <button
            onClick={() => {
              handleParse()
              setActiveTab('sync')
            }}
            className={`rounded-lg px-3 py-1 transition-colors ${
              activeTab === 'sync'
                ? 'bg-[var(--accent)] text-black'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            2. Live Sync
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`rounded-lg px-3 py-1 transition-colors ${
              activeTab === 'preview'
                ? 'bg-[var(--accent)] text-black'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            3. Preview
          </button>
        </div>
      </div>

      {/* Language Picker */}
      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
        <Languages className="h-4 w-4 text-[var(--accent)]" />
        <span>Lyrics Language:</span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-2.5 py-1 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
        >
          {languagesList.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* TAB 1: Raw Text Input */}
      {activeTab === 'text' && (
        <div className="flex flex-col gap-3">
          <label className="text-xs font-medium text-[var(--text-muted)]">
            Paste raw song lyrics (one line per verse) or standard [mm:ss.xx] LRC format:
          </label>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={10}
            placeholder={`Paste lyrics here, for example:\n[00:15.00] In the dark of the night\n[00:19.50] Shining like a diamond\n\nOr plain text without timestamps...`}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-main)] p-4 font-mono text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]/50 focus:border-[var(--accent)] focus:outline-none"
          />
          <button
            onClick={handleParse}
            className="self-end flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            <span>Process & Synchronize</span>
          </button>
        </div>
      )}

      {/* TAB 2: Live Syncing Mode */}
      {activeTab === 'sync' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
              <span>CURRENT PLAYBACK TIME: {formatTimestamp(currentPlaybackTime)}</span>
              <span>
                LINE {activeSyncIndex + 1} OF {parsedSegments.length}
              </span>
            </div>

            <div className="my-3 rounded-xl border-2 border-[var(--accent)] bg-[var(--bg-main)] p-4 text-center font-mono text-lg font-bold text-[var(--accent)]">
              {parsedSegments[activeSyncIndex]?.text || 'End of lyrics reached!'}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={stampTime}
                className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 font-mono text-sm font-bold text-black shadow-lg shadow-[var(--accent-glow)] transition-transform hover:scale-105 active:scale-95"
              >
                <Clock className="h-4 w-4" />
                <span>Stamp Timestamp ({formatTimestamp(currentPlaybackTime)})</span>
              </button>

              <button
                onClick={resetSync}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restart Alignment</span>
              </button>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto rounded-xl border border-[var(--border)] p-2">
            {parsedSegments.map((seg, idx) => (
              <div
                key={seg.id || idx}
                onClick={() => setActiveSyncIndex(idx)}
                className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-1.5 font-mono text-xs transition-colors ${
                  idx === activeSyncIndex
                    ? 'bg-[var(--accent)]/20 text-[var(--accent)] font-semibold'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <span>{seg.text}</span>
                <span>{formatTimestamp(seg.time)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Preview */}
      {activeTab === 'preview' && (
        <div className="flex flex-col gap-3">
          <div className="text-xs font-semibold text-[var(--text-muted)]">
            SYNCHRONIZED PREVIEW ({parsedSegments.length} lines)
          </div>
          <div className="max-h-60 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-main)] p-4 font-mono text-xs text-[var(--text-main)]">
            {parsedSegments.map((seg, idx) => (
              <div key={idx} className="flex gap-4 py-1 border-b border-[var(--border)]/40">
                <span className="text-[var(--accent)] w-16">{formatTimestamp(seg.time)}</span>
                <span>{seg.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-4">
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-2.5 text-xs font-bold text-black transition-transform hover:scale-105 active:scale-95"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Apply to Player</span>
        </button>
      </div>
    </div>
  )
}
