import React, { useRef, useEffect } from 'react'
import {
  RotateCcw,
  Pause,
  Play,
  Zap,
  Target,
  Clock,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import type { LyricSegment, TypingMode, TypingMetrics } from '@/types'
import { useTypingEngine } from '@/hooks/useTypingEngine'
import { useAudioSound } from '@/context/AudioSoundContext'

interface TypingEngineComponentProps {
  segments: LyricSegment[]
  playbackTime: number
  mode: TypingMode
  onModeChange: (mode: TypingMode) => void
  onSongComplete: (metrics: TypingMetrics) => void
  onPauseMusic?: () => void
  onResumeMusic?: () => void
  onRestartMusic?: () => void
}

export const TypingEngineComponent: React.FC<TypingEngineComponentProps> = ({
  segments,
  playbackTime,
  mode,
  onModeChange,
  onSongComplete,
  onPauseMusic,
  onResumeMusic,
  onRestartMusic,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLDivElement>(null)
  const inputTrapRef = useRef<HTMLInputElement>(null)
  const { playKeySound, playSuccessSound } = useAudioSound()

  const {
    currentLineIndex,
    inputBuffer,
    currentMetrics,
    isPaused,
    setIsPaused,
    isCompleted,
    handleKeyDown,
    restart,
  } = useTypingEngine({
    segments,
    playbackTime,
    mode,
    onCharacterTyped: (_char, isCorrect) => {
      playKeySound(!isCorrect)
    },
    onLineComplete: () => {
      playSuccessSound()
    },
    onSongComplete,
  })

  // Keep hidden input focused for immediate keystrokes
  useEffect(() => {
    inputTrapRef.current?.focus()
  }, [])

  // Auto-scroll to center the active lyric line smoothly
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [currentLineIndex])

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false)
      onResumeMusic?.()
      inputTrapRef.current?.focus()
    } else {
      setIsPaused(true)
      onPauseMusic?.()
    }
  }

  const handleRestart = () => {
    restart()
    onRestartMusic?.()
    inputTrapRef.current?.focus()
  }

  const activeSegment = segments[currentLineIndex]
  const targetLineText = activeSegment?.text || ''

  return (
    <div
      ref={containerRef}
      onClick={() => inputTrapRef.current?.focus()}
      className="relative flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-2xl transition-all"
    >
      {/* Hidden input to capture physical keyboard events smoothly */}
      <input
        ref={inputTrapRef}
        type="text"
        className="sr-only opacity-0 pointer-events-none"
        onKeyDown={handleKeyDown}
        autoFocus
      />

      {/* Top HUD: Live Metrics and Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        {/* Real-time stats */}
        <div className="flex items-center gap-6 font-mono text-sm">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[var(--accent)]" />
            <div>
              <span className="text-2xl font-bold text-[var(--text-main)]">
                {currentMetrics.netWpm}
              </span>
              <span className="ml-1 text-xs text-[var(--text-muted)]">WPM</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-400" />
            <div>
              <span className="text-2xl font-bold text-[var(--text-main)]">
                {currentMetrics.accuracy}%
              </span>
              <span className="ml-1 text-xs text-[var(--text-muted)]">ACC</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <div>
              <span className="text-2xl font-bold text-[var(--text-main)]">
                {currentMetrics.errorsCount}
              </span>
              <span className="ml-1 text-xs text-[var(--text-muted)]">ERR</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-400" />
            <div>
              <span className="text-2xl font-bold text-[var(--text-main)]">
                {currentMetrics.elapsedSeconds}s
              </span>
            </div>
          </div>
        </div>

        {/* Mode Selector and Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Mode pills */}
          <div className="flex rounded-xl bg-[var(--bg-subtle)] p-1 text-xs font-medium">
            {(['normal', 'rhythm', 'challenge', 'practice'] as TypingMode[]).map((m) => (
              <button
                key={m}
                onClick={(e) => {
                  e.stopPropagation()
                  onModeChange(m)
                }}
                className={`rounded-lg px-2.5 py-1 capitalize transition-all ${
                  mode === m
                    ? 'bg-[var(--accent)] text-black font-semibold shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Pause Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              togglePause()
            }}
            title={isPaused ? 'Resume' : 'Pause'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>

          {/* Restart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleRestart()
            }}
            title="Restart Practice"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Lyrics Display Scroll Area */}
      <div className="relative flex max-h-[360px] min-h-[240px] flex-col gap-3 overflow-y-auto px-2 py-4 select-none">
        {segments.map((seg, idx) => {
          const isPast = idx < currentLineIndex
          const isActive = idx === currentLineIndex
          const isUpcoming = idx > currentLineIndex

          if (isActive) {
            // Detailed character-by-character render for active line
            return (
              <div
                key={seg.id}
                ref={activeLineRef}
                className="lyric-active-glow relative my-2 rounded-2xl border-2 border-[var(--accent)] bg-[var(--bg-subtle)]/80 p-5 backdrop-blur-sm transition-all"
              >
                <div className="mb-1 flex items-center justify-between text-xs font-mono text-[var(--accent)]">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 animate-spin" />
                    <span>ACTIVE LINE ({idx + 1}/{segments.length})</span>
                  </div>
                  <span>{seg.time}s</span>
                </div>

                <div className="font-mono text-xl sm:text-2xl leading-relaxed tracking-wide text-left">
                  {targetLineText.split('').map((char, charIdx) => {
                    const isTyped = charIdx < inputBuffer.length
                    const isCurrent = charIdx === inputBuffer.length
                    const typedChar = inputBuffer[charIdx]
                    const isCorrect = typedChar === char

                    let charClass = 'text-[var(--text-muted)]'
                    if (isTyped) {
                      charClass = isCorrect
                        ? 'text-[var(--accent)] font-semibold'
                        : 'bg-red-500/30 text-red-400 font-bold underline'
                    }

                    return (
                      <span key={charIdx} className={`relative inline-block ${charClass}`}>
                        {isCurrent && (
                          <span className="animate-caret absolute -left-0.5 top-0 bottom-0 w-0.5 bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                        )}
                        {char === ' ' ? '\u00A0' : char}
                      </span>
                    )
                  })}
                  {/* Caret at end of line */}
                  {inputBuffer.length >= targetLineText.length && (
                    <span className="animate-caret inline-block h-6 w-0.5 bg-[var(--accent)]" />
                  )}
                </div>
              </div>
            )
          }

          return (
            <div
              key={seg.id}
              className={`flex items-center justify-between rounded-xl px-4 py-2 font-mono text-base transition-opacity ${
                isPast
                  ? 'opacity-30 line-through text-[var(--text-muted)]'
                  : isUpcoming
                  ? 'opacity-50 text-[var(--text-muted)] hover:opacity-75'
                  : ''
              }`}
            >
              <span>{seg.text}</span>
              <span className="text-xs opacity-60 font-mono">{seg.time}s</span>
            </div>
          )
        })}

        {segments.length === 0 && (
          <div className="flex h-40 flex-col items-center justify-center text-center text-sm text-[var(--text-muted)]">
            <span>No synchronized lyrics loaded for this track yet.</span>
            <span className="mt-1 text-xs">Switch to Manual Input or choose a curated song.</span>
          </div>
        )}
      </div>

      {/* Bottom Status / Instructions */}
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
        <span>Click anywhere inside and type. Press Backspace to correct.</span>
        <div className="flex items-center gap-3 font-mono">
          <span>PROGRESS: {currentMetrics.completionRate}%</span>
          {isCompleted && (
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-400 font-bold">
              COMPLETED!
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
