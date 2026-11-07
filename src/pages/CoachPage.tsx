import React, { useState, useEffect } from 'react'
import {
  BrainCircuit,
  Sparkles,
  Zap,
  Target,
  ArrowRight,
  RotateCcw,
  Key,
  Flame,
  CheckCircle,
} from 'lucide-react'
import { loadStoredSessions } from '@/lib/storage'
import { analyzeTypingSession } from '@/lib/groqCoach'
import type { AICoachAnalysis } from '@/types'

export const CoachPage: React.FC = () => {
  const [analysis, setAnalysis] = useState<AICoachAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeDrillIndex, setActiveDrillIndex] = useState(0)
  const [drillInput, setDrillInput] = useState('')
  const [drillComplete, setDrillComplete] = useState(false)

  useEffect(() => {
    const sessions = loadStoredSessions()
    const latest = sessions[0]

    const fallbackMetrics = {
      grossWpm: 68,
      netWpm: 62,
      accuracy: 94.5,
      correctChars: 310,
      incorrectChars: 18,
      totalTypedChars: 328,
      errorsCount: 18,
      elapsedSeconds: 60,
      completionRate: 100,
      characterStats: {
        e: { correct: 45, incorrect: 1 },
        t: { correct: 30, incorrect: 3 },
        p: { correct: 12, incorrect: 4 },
        b: { correct: 8, incorrect: 3 },
      },
    }

    const metricsToAnalyze = latest ? latest.metrics : fallbackMetrics
    const songTitle = latest ? latest.songTitle : 'Practice Melody'
    const songArtist = latest ? latest.songArtist : 'Rhythm Coach'

    analyzeTypingSession(metricsToAnalyze, songTitle, songArtist)
      .then((res) => {
        setAnalysis(res)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const currentDrill = analysis?.recommendedDrills[activeDrillIndex]

  const handleDrillType = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setDrillInput(val)

    if (currentDrill && val === currentDrill.sampleText) {
      setDrillComplete(true)
    }
  }

  const nextDrill = () => {
    if (analysis && activeDrillIndex < analysis.recommendedDrills.length - 1) {
      setActiveDrillIndex((i) => i + 1)
      setDrillInput('')
      setDrillComplete(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 py-6 max-w-5xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/15 px-4 py-1 text-xs font-semibold text-purple-400 border border-purple-500/30 w-fit">
          <BrainCircuit className="h-4 w-4" />
          <span>Groq-Powered AI Typing Coach</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-main)]">
          Intelligent Keystroke Coach
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Neural evaluation of your typing habits, timing consistency, and custom finger dexterity exercises.
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text-muted)] animate-pulse">
          Consulting AI coach model and diagnosing typing patterns...
        </div>
      ) : analysis ? (
        <div className="flex flex-col gap-8">
          {/* Summary and Grade Banner */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[var(--border)] bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-subtle)] to-[var(--bg-card)] p-6 sm:p-8 shadow-xl">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[var(--text-main)]">
                Performance Evaluation
              </h3>
              <p className="mt-2 text-sm text-[var(--text-main)] leading-relaxed">
                {analysis.summary}
              </p>
              <p className="mt-3 text-xs text-[var(--text-muted)] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                <span>{analysis.rhythmConsistency}</span>
              </p>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent-glow)] px-8 py-5 text-center">
              <span className="text-xs font-mono text-[var(--text-muted)]">OVERALL GRADE</span>
              <span className="text-5xl font-extrabold text-[var(--accent)] font-mono">
                {analysis.overallGrade}
              </span>
            </div>
          </div>

          {/* Weak Keys Heatmap Section */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Key className="h-5 w-5 text-red-400" />
              <h3 className="text-base font-bold text-[var(--text-main)]">
                Identified Weak Characters & High-Error Keys
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Based on your session error logs, these keys show the highest hesitation and misstrike rates:
            </p>

            <div className="flex flex-wrap gap-3">
              {analysis.weakKeys.map((k) => (
                <div
                  key={k}
                  className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 font-mono text-sm font-bold text-red-400 shadow-sm"
                >
                  <span className="text-lg uppercase">[{k}]</span>
                  <span className="text-xs text-[var(--text-muted)] font-normal">High friction</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Personalized Drills */}
          {currentDrill && (
            <div className="rounded-3xl border-2 border-[var(--accent)]/40 bg-[var(--bg-card)] p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-amber-400" />
                  <h3 className="text-base font-bold text-[var(--text-main)]">
                    Targeted Training Drill ({activeDrillIndex + 1}/{analysis.recommendedDrills.length})
                  </h3>
                </div>
                <span className="text-xs text-[var(--text-muted)] font-mono uppercase">
                  {currentDrill.title}
                </span>
              </div>

              <p className="text-xs text-[var(--text-muted)]">{currentDrill.description}</p>

              {/* Drill Text To Match */}
              <div className="my-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-main)] p-5 text-center font-mono text-xl sm:text-2xl font-bold tracking-wider text-[var(--accent)]">
                {currentDrill.sampleText}
              </div>

              {/* Keystroke Entry Input */}
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={drillInput}
                  onChange={handleDrillType}
                  placeholder="Type the exact drill text above..."
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-main)] p-4 text-center font-mono text-lg text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                />

                {drillComplete && (
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                    <span>Great job! Drill completed perfectly.</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                {activeDrillIndex < analysis.recommendedDrills.length - 1 && (
                  <button
                    onClick={nextDrill}
                    className="flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-xs font-bold text-black"
                  >
                    <span>Next Drill</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Actionable Tips */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-xl">
            <h3 className="text-base font-bold text-[var(--text-main)] mb-4">
              Coach Recommendations
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-[var(--text-muted)]">
              {analysis.actionableTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-glow)] text-[10px] font-bold text-[var(--accent)]">
                    ✓
                  </span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}
