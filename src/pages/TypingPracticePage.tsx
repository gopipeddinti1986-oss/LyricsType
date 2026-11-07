import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Music,
  Edit3,
  Sliders,
  Sparkles,
  ArrowLeft,
  Share2,
} from 'lucide-react'
import { CURATED_SONGS } from '@/data/curatedSongs'
import { loadCustomSongs, saveStoredSession } from '@/lib/storage'
import { YouTubePlayer } from '@/components/player/YouTubePlayer'
import { TypingEngineComponent } from '@/components/typing/TypingEngineComponent'
import { ManualLyricsEditor } from '@/components/lyrics/ManualLyricsEditor'
import { useAuth } from '@/context/AuthContext'
import type { Song, TypingMode, TypingMetrics, TypingSessionRecord, LyricSegment } from '@/types'

export const TypingPracticePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Find song in curated or custom list
  const currentSong = useMemo(() => {
    const customList = loadCustomSongs()
    const all = [...customList, ...CURATED_SONGS]
    if (id) {
      const found = all.find((s) => s.id === id)
      if (found) return found
    }
    return CURATED_SONGS[0] // Default fallback
  }, [id])

  const [activeLyrics, setActiveLyrics] = useState<LyricSegment[]>(currentSong.lyrics)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [songDuration, setSongDuration] = useState(currentSong.duration || 180)
  const [mode, setMode] = useState<TypingMode>('rhythm')
  const [showLyricsEditor, setShowLyricsEditor] = useState(false)
  const [isPlayingMusic, setIsPlayingMusic] = useState(false)

  // Update lyrics when song changes
  useEffect(() => {
    setActiveLyrics(currentSong.lyrics)
  }, [currentSong])

  const handleTimeUpdate = useCallback((time: number, duration: number) => {
    setPlaybackTime(time)
    if (duration > 0) setSongDuration(duration)
  }, [])

  const handleSongComplete = (metrics: TypingMetrics) => {
    const sessionId = `session-${Date.now()}`
    const record: TypingSessionRecord = {
      id: sessionId,
      songId: currentSong.id,
      songTitle: currentSong.title,
      songArtist: currentSong.artist,
      mode,
      metrics,
      createdAt: new Date().toISOString(),
      userId: user?.id,
    }

    saveStoredSession(record)
    navigate(`/results/${sessionId}`, { state: { session: record } })
  }

  const handleApplyCustomLyrics = (newSegments: LyricSegment[], _lang: string) => {
    setActiveLyrics(newSegments)
    setShowLyricsEditor(false)
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Top Navigation & Song Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/songs')}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text-main)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
                {currentSong.title}
              </h1>
              <span className="rounded-full bg-[var(--accent-glow)] px-2.5 py-0.5 text-xs font-mono font-bold text-[var(--accent)] border border-[var(--accent)]/30">
                {currentSong.language}
              </span>
            </div>
            <span className="text-xs text-[var(--text-muted)]">
              {currentSong.artist} • {currentSong.genre}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLyricsEditor(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text-main)]"
          >
            <Edit3 className="h-4 w-4 text-[var(--accent)]" />
            <span>Edit / Sync Lyrics</span>
          </button>
        </div>
      </div>

      {/* Main Grid: YouTube Player + Typing Engine */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: YouTube Player */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <YouTubePlayer
            videoId={currentSong.youtubeVideoId}
            onTimeUpdate={handleTimeUpdate}
            onPlaybackStateChange={setIsPlayingMusic}
            autoPlay={false}
          />

          {/* Song Details Card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 text-xs font-mono text-[var(--text-muted)]">
            <div className="flex items-center justify-between py-1 border-b border-[var(--border)]">
              <span>ACTIVE MODE:</span>
              <span className="capitalize text-[var(--accent)] font-bold">{mode}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[var(--border)]">
              <span>SYNCED LINES:</span>
              <span>{activeLyrics.length} Lines</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>DIFFICULTY:</span>
              <span className="uppercase text-[var(--text-main)]">{currentSong.difficulty}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Typing Engine */}
        <div className="lg:col-span-7">
          <TypingEngineComponent
            segments={activeLyrics}
            playbackTime={playbackTime}
            mode={mode}
            onModeChange={setMode}
            onSongComplete={handleSongComplete}
          />
        </div>
      </div>

      {/* Manual Lyrics Studio Modal */}
      {showLyricsEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-3xl">
            <ManualLyricsEditor
              currentPlaybackTime={playbackTime}
              songDuration={songDuration}
              initialLyrics={activeLyrics}
              onApplyLyrics={handleApplyCustomLyrics}
              onClose={() => setShowLyricsEditor(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
