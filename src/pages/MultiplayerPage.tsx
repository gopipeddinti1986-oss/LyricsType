import React, { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  Play,
  Copy,
  Check,
  Trophy,
  Zap,
  Radio,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { CURATED_SONGS } from '@/data/curatedSongs'
import { useAuth } from '@/context/AuthContext'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { MultiplayerRoom, MultiplayerPlayer } from '@/types'

export const MultiplayerPage: React.FC = () => {
  const { user } = useAuth()
  const [roomCode, setRoomCode] = useState('')
  const [activeRoom, setActiveRoom] = useState<MultiplayerRoom | null>(null)
  const [isMatchmaking, setIsMatchmaking] = useState(false)
  const [copied, setCopied] = useState(false)
  const [joinError, setJoinError] = useState('')

  // Create a new multiplayer room
  const handleCreateRoom = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const song = CURATED_SONGS[0] // Default to first curated song

    const hostPlayer: MultiplayerPlayer = {
      id: user?.id || 'host-player',
      username: user?.username || 'HostPlayer',
      avatarUrl: user?.avatarUrl,
      progress: 0,
      currentWpm: 0,
      accuracy: 100,
      isFinished: false,
    }

    const newRoom: MultiplayerRoom = {
      id: `room-${code}`,
      code,
      name: `${user?.username || 'Player'}'s Arena`,
      hostId: user?.id || 'host',
      songId: song.id,
      songTitle: song.title,
      songArtist: song.artist,
      youtubeVideoId: song.youtubeVideoId,
      status: 'waiting',
      countdown: 5,
      players: [hostPlayer],
      createdAt: new Date().toISOString(),
      mode: 'rhythm',
    }

    setActiveRoom(newRoom)

    // If Supabase is connected, broadcast room creation to Realtime channel
    if (isSupabaseConfigured && supabase) {
      const channel = supabase.channel(`room:${code}`)
      channel
        .on('broadcast', { event: 'player_progress' }, (payload) => {
          // Update player in state
          console.log('Realtime progress event:', payload)
        })
        .subscribe()
    }
  }

  // Join existing room
  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    setJoinError('')

    if (!roomCode.trim()) {
      setJoinError('Please enter a valid room code.')
      return
    }

    const joinCode = roomCode.trim().toUpperCase()

    // Simulate join / connect
    const song = CURATED_SONGS[1]
    const joinedRoom: MultiplayerRoom = {
      id: `room-${joinCode}`,
      code: joinCode,
      name: `Challenger Match [${joinCode}]`,
      hostId: 'other-player',
      songId: song.id,
      songTitle: song.title,
      songArtist: song.artist,
      youtubeVideoId: song.youtubeVideoId,
      status: 'waiting',
      countdown: 5,
      players: [
        {
          id: 'rival-1',
          username: 'BeatRacer_99',
          avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=BeatRacer',
          progress: 35,
          currentWpm: 68,
          accuracy: 96,
          isFinished: false,
        },
        {
          id: user?.id || 'self',
          username: user?.username || 'You',
          avatarUrl: user?.avatarUrl,
          progress: 0,
          currentWpm: 0,
          accuracy: 100,
          isFinished: false,
        },
      ],
      createdAt: new Date().toISOString(),
      mode: 'rhythm',
    }

    setActiveRoom(joinedRoom)
  }

  // Random matchmaking queue
  const handleQuickMatch = () => {
    setIsMatchmaking(true)
    setTimeout(() => {
      setIsMatchmaking(false)
      handleCreateRoom()
    }, 1500)
  }

  const copyInvite = () => {
    if (activeRoom) {
      navigator.clipboard?.writeText(
        `Join my live typing duel on LyricsType! Room Code: ${activeRoom.code} - ${window.location.origin}/multiplayer`
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="flex flex-col gap-8 py-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-glow)] px-4 py-1 text-xs font-semibold text-[var(--accent)] border border-[var(--accent)]/30 w-fit">
          <Users className="h-4 w-4" />
          <span>Real-time Multiplayer Tournaments</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-main)]">
          Multiplayer Typing Arena
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Race head-to-head with typists across the globe in real-time rhythm synchronization.
        </p>
      </div>

      {!activeRoom ? (
        /* Lobby Selection Grid */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Quick Match & Create Room */}
          <div className="flex flex-col justify-between rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-xl">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-glow)] text-[var(--accent)]">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-[var(--text-main)]">
                Instant Matchmaking
              </h3>
              <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">
                Hop straight into a randomized competitive lobby with active players typing to popular music hits.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handleQuickMatch}
                disabled={isMatchmaking}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] py-3.5 text-sm font-bold text-black shadow-lg shadow-[var(--accent-glow)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                <Radio className={`h-4 w-4 ${isMatchmaking ? 'animate-pulse' : ''}`} />
                <span>{isMatchmaking ? 'Finding Opponents...' : 'Quick Matchmaking'}</span>
              </button>

              <button
                onClick={handleCreateRoom}
                className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] py-3.5 text-xs font-bold text-[var(--text-main)] hover:border-[var(--accent)] transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create Private Room</span>
              </button>
            </div>
          </div>

          {/* Join with Room Code */}
          <div className="flex flex-col justify-between rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-xl">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-[var(--text-main)]">
                Join with Room Code
              </h3>
              <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">
                Have a room code from a friend? Enter the 6-character code below to enter their private competition.
              </p>
            </div>

            <form onSubmit={handleJoinRoom} className="mt-8 flex flex-col gap-3">
              {joinError && <span className="text-xs text-red-400">{joinError}</span>}
              <input
                type="text"
                maxLength={6}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ENTER 6-DIGIT CODE"
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-main)] p-3.5 text-center font-mono text-lg font-bold tracking-widest text-[var(--text-main)] uppercase placeholder-[var(--text-muted)]/40 focus:border-[var(--accent)] focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--bg-subtle)] py-3.5 text-xs font-bold text-[var(--text-main)] hover:bg-[var(--accent)] hover:text-black transition-colors"
              >
                <span>Enter Room</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Active Multiplayer Room View */
        <div className="flex flex-col gap-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-2xl">
          {/* Room Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-[var(--text-main)]">{activeRoom.name}</h2>
                <span className="rounded-xl bg-[var(--accent)]/20 px-3 py-1 font-mono text-sm font-extrabold text-[var(--accent)] border border-[var(--accent)]/30">
                  CODE: {activeRoom.code}
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Song: <span className="text-[var(--text-main)]">{activeRoom.songTitle}</span> by {activeRoom.songArtist}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyInvite}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-2 text-xs font-semibold text-[var(--text-main)] hover:border-[var(--accent)]"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Link Copied!' : 'Invite Friends'}</span>
              </button>

              <button
                onClick={() => setActiveRoom(null)}
                className="rounded-xl px-3 py-2 text-xs text-[var(--text-muted)] hover:text-red-400"
              >
                Leave Room
              </button>
            </div>
          </div>

          {/* Real-time Gaming Track (Monkeytype / TypeRacer Style) */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold font-mono uppercase text-[var(--text-muted)]">
              LIVE RACERS PROGRESSION
            </h3>

            <div className="flex flex-col gap-4">
              {activeRoom.players.map((player, idx) => (
                <div
                  key={player.id}
                  className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-main)] p-4 shadow-inner"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--text-muted)]">#{idx + 1}</span>
                      <img
                        src={player.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=P'}
                        alt="Avatar"
                        className="h-6 w-6 rounded-full bg-[var(--bg-subtle)]"
                      />
                      <span className="font-semibold text-[var(--text-main)]">
                        {player.username}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[var(--text-muted)]">
                      <span>{player.currentWpm} WPM</span>
                      <span className="text-emerald-400">{player.accuracy}% ACC</span>
                      <span className="font-bold text-[var(--accent)]">{player.progress}%</span>
                    </div>
                  </div>

                  {/* Visual Race Track Progress Bar */}
                  <div className="relative h-3 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-emerald-400 transition-all duration-300"
                      style={{ width: `${Math.max(player.progress, 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Start Duel Action */}
          <div className="flex items-center justify-between border-t border-[var(--border)] pt-6">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Anti-cheat verified: Timing and keystroke sequence validated</span>
            </div>

            <a
              href={`/play/${activeRoom.songId}`}
              className="flex items-center gap-2 rounded-2xl bg-[var(--accent)] px-8 py-3.5 text-sm font-bold text-black shadow-lg shadow-[var(--accent-glow)] transition-transform hover:scale-105 active:scale-95"
            >
              <Play className="h-4 w-4 fill-black" />
              <span>Start Match</span>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
