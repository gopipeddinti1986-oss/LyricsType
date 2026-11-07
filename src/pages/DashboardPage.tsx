import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Zap,
  Target,
  Trophy,
  Clock,
  Music,
  ArrowRight,
  TrendingUp,
  History,
  Play,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { loadStoredSessions } from '@/lib/storage'
import { useAuth } from '@/context/AuthContext'

export const DashboardPage: React.FC = () => {
  const { user, isGuest } = useAuth()
  const sessions = useMemo(() => loadStoredSessions(), [])

  // Aggregate user analytics
  const analytics = useMemo(() => {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageWpm: 0,
        bestWpm: 0,
        averageAccuracy: 100,
        totalDurationSeconds: 0,
      }
    }

    const totalWpm = sessions.reduce((sum, s) => sum + s.metrics.netWpm, 0)
    const totalAcc = sessions.reduce((sum, s) => sum + s.metrics.accuracy, 0)
    const bestWpm = Math.max(...sessions.map((s) => s.metrics.netWpm))
    const totalDuration = sessions.reduce((sum, s) => sum + s.metrics.elapsedSeconds, 0)

    return {
      totalSessions: sessions.length,
      averageWpm: Math.round(totalWpm / sessions.length),
      bestWpm,
      averageAccuracy: parseFloat((totalAcc / sessions.length).toFixed(1)),
      totalDurationSeconds: totalDuration,
    }
  }, [sessions])

  // Weekly progression chart data
  const chartData = useMemo(() => {
    return sessions.slice(0, 10).reverse().map((s, idx) => ({
      index: `#${idx + 1}`,
      wpm: s.metrics.netWpm,
      acc: s.metrics.accuracy,
      song: s.songTitle,
    }))
  }, [sessions])

  const formatDuration = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m ${totalSecs % 60}s`
  }

  return (
    <div className="flex flex-col gap-8 py-6">
      {/* Top Welcome Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[var(--border)] bg-gradient-to-r from-[var(--bg-card)] to-[var(--bg-subtle)] p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}
            alt="Avatar"
            className="h-16 w-16 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[var(--text-main)]">
                Welcome back, {user?.username || 'Typist'}!
              </h1>
              {isGuest && (
                <span className="rounded-full bg-yellow-500/15 px-2.5 py-0.5 text-xs font-mono font-semibold text-yellow-500 border border-yellow-500/20">
                  Guest Mode
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Your typing rhythm analytics and historical progress overview.
            </p>
          </div>
        </div>

        {isGuest && (
          <Link
            to="/auth/login"
            className="rounded-xl border border-[var(--accent)] bg-[var(--accent-glow)] px-4 py-2 text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-colors"
          >
            Sign In to Cloud Sync
          </Link>
        )}
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Trophy className="h-4 w-4 text-[var(--accent)]" />
            <span>BEST WPM</span>
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono text-[var(--text-main)]">
            {analytics.bestWpm}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] font-mono mt-1">Personal Record</div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Zap className="h-4 w-4 text-emerald-400" />
            <span>AVG SPEED</span>
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono text-emerald-400">
            {analytics.averageWpm}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] font-mono mt-1">Net WPM Standard</div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Target className="h-4 w-4 text-blue-400" />
            <span>AVG ACCURACY</span>
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono text-blue-400">
            {analytics.averageAccuracy}%
          </div>
          <div className="text-[10px] text-[var(--text-muted)] font-mono mt-1">Precision Rating</div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Clock className="h-4 w-4 text-purple-400" />
            <span>PRACTICE TIME</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-purple-400">
            {formatDuration(analytics.totalDurationSeconds)}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] font-mono mt-1">
            {analytics.totalSessions} Total Sessions
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
            <h3 className="text-base font-bold text-[var(--text-main)]">
              Historical Performance Velocity
            </h3>
          </div>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            Last {chartData.length} Sessions
          </span>
        </div>

        {chartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="index" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderColor: 'var(--border)',
                    borderRadius: '12px',
                    color: 'var(--text-main)',
                  }}
                />
                <Bar dataKey="wpm" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center text-xs text-[var(--text-muted)]">
            No completed sessions recorded yet. Play a song to visualize your velocity graph!
          </div>
        )}
      </div>

      {/* Recent Practice History Table */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-[var(--accent)]" />
            <h3 className="text-base font-bold text-[var(--text-main)]">
              Recent Practice Sessions
            </h3>
          </div>
          <Link
            to="/songs"
            className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            <span>Play New Track</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <th className="py-3 px-4 font-semibold">TRACK</th>
                <th className="py-3 px-4 font-semibold">MODE</th>
                <th className="py-3 px-4 font-semibold">NET WPM</th>
                <th className="py-3 px-4 font-semibold">ACCURACY</th>
                <th className="py-3 px-4 font-semibold">ERRORS</th>
                <th className="py-3 px-4 font-semibold">DATE</th>
                <th className="py-3 px-4 text-right font-semibold">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {sessions.slice(0, 8).map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-[var(--border)]/40 hover:bg-[var(--bg-subtle)]/50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-[var(--text-main)]">
                    <div>{s.songTitle}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{s.songArtist}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize text-[var(--accent)]">{s.mode}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[var(--text-main)]">
                    {s.metrics.netWpm}
                  </td>
                  <td className="py-3 px-4 text-emerald-400">
                    {s.metrics.accuracy}%
                  </td>
                  <td className="py-3 px-4 text-red-400">
                    {s.metrics.errorsCount}
                  </td>
                  <td className="py-3 px-4 text-[var(--text-muted)]">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/play/${s.songId}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-[var(--bg-subtle)] px-2.5 py-1 text-[11px] text-[var(--text-main)] hover:bg-[var(--accent)] hover:text-black transition-colors"
                    >
                      <Play className="h-3 w-3" />
                      <span>Retry</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--text-muted)]">
                    No sessions logged yet. Head over to the song catalog to begin your journey!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
