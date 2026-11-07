import React from 'react'
import { Link } from 'react-router-dom'
import {
  Play,
  Sparkles,
  Music,
  Zap,
  Users,
  BrainCircuit,
  Headphones,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import { CURATED_SONGS } from '@/data/curatedSongs'

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-24 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-main)] p-8 sm:p-14 lg:p-20 shadow-2xl">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[var(--accent)]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-glow)] px-4 py-1.5 text-xs font-semibold text-[var(--accent)]">
            <Sparkles className="h-4 w-4" />
            <span>Next-Gen Music-Synchronized Typing Practice</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Type to the Beat of Your{' '}
            <span className="bg-gradient-to-r from-[var(--accent)] via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Favorite Music
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-[var(--text-muted)] leading-relaxed">
            Paste any YouTube URL, stream authentic tracks, and practice synchronized lyrics with live WPM, realistic mechanical switch sound effects, multiplayer tournaments, and an AI typing coach.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/songs"
              className="flex items-center gap-2 rounded-2xl bg-[var(--accent)] px-8 py-4 text-base font-bold text-black shadow-lg shadow-[var(--accent-glow)] transition-all hover:scale-105 active:scale-95"
            >
              <Play className="h-5 w-5 fill-black" />
              <span>Start Typing Now</span>
            </Link>

            <Link
              to="/multiplayer"
              className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-7 py-4 text-base font-semibold text-[var(--text-main)] transition-all hover:border-[var(--accent)] hover:bg-[var(--bg-subtle)]"
            >
              <Users className="h-5 w-5 text-[var(--accent)]" />
              <span>Multiplayer Arena</span>
            </Link>
          </div>

          {/* Quick stats ticker */}
          <div className="mt-16 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-8 sm:grid-cols-4 font-mono text-left">
            <div>
              <div className="text-2xl font-bold text-[var(--text-main)]">100% Free</div>
              <div className="text-xs text-[var(--text-muted)]">YouTube IFrame Engine</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--accent)]">4 Modes</div>
              <div className="text-xs text-[var(--text-muted)]">Rhythm, Normal, Challenge, Practice</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--text-main)]">0 ms</div>
              <div className="text-xs text-[var(--text-muted)]">Web Audio Switch Synthesizer</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">Groq AI</div>
              <div className="text-xs text-[var(--text-muted)]">Personalized Error Coach</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Songs Showcase */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-main)]">
              Curated Popular Tracks
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Pre-synchronized lyrics ready for immediate playback and typing practice.
            </p>
          </div>
          <Link
            to="/songs"
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            <span>View All Songs</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CURATED_SONGS.slice(0, 6).map((song) => (
            <Link
              key={song.id}
              to={`/play/${song.id}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 transition-all hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-xl hover:shadow-[var(--accent-glow)]"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                <img
                  src={song.coverUrl}
                  alt={song.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                  <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white/90 backdrop-blur-sm">
                    {song.language}
                  </span>
                  <span className="rounded bg-[var(--accent)]/90 px-2 py-0.5 text-[10px] font-bold text-black uppercase">
                    {song.difficulty}
                  </span>
                </div>
                <div className="absolute right-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-black shadow-lg opacity-0 transition-opacity group-hover:opacity-100">
                  <Play className="h-5 w-5 fill-black ml-0.5" />
                </div>
              </div>

              <div className="mt-3 flex flex-col">
                <h3 className="font-bold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">
                  {song.title}
                </h3>
                <span className="text-xs text-[var(--text-muted)]">{song.artist}</span>
                <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                  <span>{song.genre}</span>
                  <span>{song.lyrics.length} Lines Synced</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-glow)] text-[var(--accent)]">
            <Headphones className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-main)]">
            Official YouTube Streaming
          </h3>
          <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">
            Built strictly on the official YouTube IFrame Player API. Seamlessly paste any music video or song link, sync lyrics, and play with high audio fidelity.
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-main)]">
            Sub-millisecond Typing Engine
          </h3>
          <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">
            Character-by-character validation, animated carets, mistake tracking, 5-characters/word standard WPM, and zero-latency Web Audio mechanical keyboard sounds.
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-400">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-main)]">
            AI Typing Coach via Groq
          </h3>
          <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">
            Analyzes your keystroke rhythm, isolates weak characters and mistyped keys, and creates personalized typing drills to accelerate your typing speed.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8 sm:p-12">
        <h2 className="text-center text-3xl font-extrabold text-[var(--text-main)]">
          How LyricsType Works
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-4 text-center">
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] font-mono font-bold text-black">
              1
            </div>
            <h4 className="mt-4 font-bold text-[var(--text-main)]">Pick or Paste Song</h4>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Choose from our curated songs or paste any YouTube URL.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] font-mono font-bold text-black">
              2
            </div>
            <h4 className="mt-4 font-bold text-[var(--text-main)]">Load Lyrics</h4>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Enjoy auto-synced lyrics or use our 1-click live alignment tool.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] font-mono font-bold text-black">
              3
            </div>
            <h4 className="mt-4 font-bold text-[var(--text-main)]">Type with the Rhythm</h4>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Follow highlighted lyrics, listen to clicky switches, and build combos.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] font-mono font-bold text-black">
              4
            </div>
            <h4 className="mt-4 font-bold text-[var(--text-main)]">Level Up Analytics</h4>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Review WPM graphs, receive Groq AI tips, and climb the leaderboard.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
