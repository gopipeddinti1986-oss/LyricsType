import React, { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import {
  Trophy,
  RotateCcw,
  Sparkles,
  Zap,
  Target,
  AlertCircle,
  Clock,
  ArrowRight,
  BrainCircuit,
  Share2,
  Check,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { loadStoredSessions } from '@/lib/storage'
import { analyzeTypingSession } from '@/lib/groqCoach'
import type { TypingSessionRecord, AICoachAnalysis } from '@/types'

export const ResultsPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  // Retrieve session from location state or local storage
  const [session, setSession] = useState<TypingSessionRecord | null>(() => {
    if (location.state?.session) return location.state.session
    const sessions = loadStoredSessions()
    return sessions.find((s) => s.id === sessionId) || sessions[0] || null
  })

  const [coachAnalysis, setCoachAnalysis] = useState<AICoachAnalysis | null>(null)
  const [isLoadingCoach, setIsLoadingCoach] = useState(true)
  const [copied, setCopied] = useState(false)

  // Fire celebratory confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1DB954', '#00f0ff', '#e2b714', '#ffffff'],
      })
    } catch {}
  }, [])

  // Run AI Coach Analysis on results
  useEffect(() => {
    if (session) {
      setIsLoadingCoach(true)
      analyzeTypingSession(session.metrics, session.songTitle, session.songArtist)
        .then((res) => {
          setCoachAnalysis(res)
          setIsLoadingCoach(false)
        })
        .catch(() => {
          setIsLoadingCoach(false)
        })
    }
  }, [session])

  if (!session) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-bold text-[var(--text-main)]">No Session Data Found</h2>
        <Link
          to="/songs"
          className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-xs font-bold text-black"
        >
          Select a Song to Practice
        </Link>
      </div>
    )
  }

  const { metrics } = session

  // Mock performance curve data based on elapsed time and WPM
  const chartData = [
    { time: '0s', wpm: Math.round(metrics.netWpm * 0.7), acc: metrics.accuracy },
    { time: `${Math.round(metrics.elapsedSeconds * 0.25)}s`, wpm: Math.round(metrics.netWpm * 0.85), acc: metrics.accuracy },
    { time: `${Math.round(metrics.elapsedSeconds * 0.5)}s`, wpm: Math.round(metrics.netWpm * 1.05), acc: metrics.accuracy },
    { time: `${Math.round(metrics.elapsedSeconds * 0.75)}s`, wpm: Math.round(metrics.netWpm * 0.98), acc: metrics.accuracy },
    { time: `${metrics.elapsedSeconds}s`, wpm: metrics.netWpm, acc: metrics.accuracy },
  ]

  const handleShare = () => {
    const text = `🎵 I just scored ${metrics.netWpm} WPM with ${metrics.accuracy}% accuracy typing to "${session.songTitle}" on LyricsType! Beat my score: ${window.location.origin}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="flex flex-col gap-8 py-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col items-center text-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-glow)] px-4 py-1 text-xs font-semibold text-[var(--accent)] border border-[var(--accent)]/30">
          <Trophy className="h-4 w-4" />
          <span>Session Complete!</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-main)]">
          {session.songTitle}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {session.songArtist} • Mode: <span className="capitalize text-[var(--accent)]">{session.mode}</span>
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 text-center shadow-lg">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Zap className="h-4 w-4 text-[var(--accent)]" />
            <span>NET SPEED</span>
          </div>
          <span className="mt-2 text-4xl font-extrabold font-mono text-[var(--accent)]">
            {metrics.netWpm}
          </span>
          <span className="text-[11px] font-mono text-[var(--text-muted)] mt-1">
            {metrics.grossWpm} Gross WPM
          </span>
        </div>

        <div className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 text-center shadow-lg">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Target className="h-4 w-4 text-emerald-400" />
            <span>ACCURACY</span>
          </div>
          <span className="mt-2 text-4xl font-extrabold font-mono text-emerald-400">
            {metrics.accuracy}%
          </span>
          <span className="text-[11px] font-mono text-[var(--text-muted)] mt-1">
            {metrics.correctChars} / {metrics.totalTypedChars} Chars
          </span>
        </div>

        <div className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 text-center shadow-lg">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)]">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span>TOTAL ERRORS</span>
          </div>
          <span className="mt-2 text-4xl font-extrabold font-mono text-red-400">
            {metrics.errorsCount}
          </span>
          <span className="text-[11px] font-mono text-[var(--text-muted)] mt-1">
            {metrics.incorrectChars} Misfires
          </span>
        </div>

        <div className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 text-center shadow-lg">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Clock className="h-4 w-4 text-blue-400" />
            <span>TIME & PROGRESS</span>
          </div>
          <span className="mt-2 text-4xl font-extrabold font-mono text-blue-400">
            {metrics.completionRate}%
          </span>
          <span className="text-[11px] font-mono text-[var(--text-muted)] mt-1">
            {metrics.elapsedSeconds}s duration
          </span>
        </div>
      </div>

      {/* Performance Progression Chart */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-xl">
        <h3 className="text-base font-bold text-[var(--text-main)] mb-4">
          WPM Cadence Timeline
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderColor: 'var(--border)',
                  borderRadius: '12px',
                  color: 'var(--text-main)',
                }}
              />
              <Area
                type="monotone"
                dataKey="wpm"
                stroke="var(--accent)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#wpmGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Coach Analysis Card */}
      <div className="rounded-3xl border border-[var(--border)] bg-gradient-to-tr from-[var(--bg-card)] to-[var(--bg-subtle)] p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text-main)]">
              Groq AI Typing Coach Feedback
            </h3>
            <span className="text-xs text-[var(--text-muted)]">
              Real-time statistical evaluation of rhythm, mistakes, and finger dexterity
            </span>
          </div>
        </div>

        {isLoadingCoach ? (
          <div className="flex h-32 items-center justify-center text-xs text-[var(--text-muted)] animate-pulse">
            Analyzing cadence and calculating recommendations...
          </div>
        ) : coachAnalysis ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[var(--bg-main)] p-4 border border-[var(--border)]">
              <div className="flex-1">
                <p className="text-sm text-[var(--text-main)] leading-relaxed">
                  {coachAnalysis.summary}
                </p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  {coachAnalysis.rhythmConsistency}
                </p>
              </div>

              <div className="flex flex-col items-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-3">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-mono">
                  RHYTHM GRADE
                </span>
                <span className="text-3xl font-extrabold text-[var(--accent)] font-mono">
                  {coachAnalysis.overallGrade}
                </span>
              </div>
            </div>

            {/* Weak Keys */}
            {coachAnalysis.weakKeys.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase font-mono">
                  KEYS NEEDING ATTENTION:
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {coachAnalysis.weakKeys.map((key) => (
                    <span
                      key={key}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1 font-mono text-xs font-bold text-red-400"
                    >
                      [{key}]
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Drills */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {coachAnalysis.recommendedDrills.map((drill, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg-main)] p-4 text-xs"
                >
                  <h4 className="font-bold text-[var(--text-main)]">{drill.title}</h4>
                  <p className="mt-1 text-[var(--text-muted)]">{drill.description}</p>
                  <div className="mt-2 rounded-lg bg-[var(--bg-subtle)] p-2 font-mono text-[var(--accent)]">
                    {drill.sampleText}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-6">
        <button
          onClick={() => navigate(`/play/${session.songId}`)}
          className="flex items-center gap-2 rounded-2xl bg-[var(--accent)] px-6 py-3.5 text-sm font-bold text-black shadow-lg shadow-[var(--accent-glow)] transition-transform hover:scale-105 active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Play Again</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-3.5 text-xs font-semibold text-[var(--text-main)] hover:border-[var(--accent)]"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Share Score'}</span>
          </button>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-3.5 text-xs font-semibold text-[var(--text-main)] hover:border-[var(--accent)]"
          >
            <span>View Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
