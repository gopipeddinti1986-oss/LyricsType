import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Gauge,
  Radio,
  ExternalLink,
} from 'lucide-react'
import { AudioVisualizer } from '@/components/common/AudioVisualizer'

// YouTube IFrame Player API types
declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          videoId: string
          playerVars?: Record<string, unknown>
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void
            onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void
            onError?: (event: { data: number }) => void
          }
        }
      ) => YTPlayerInstance
      PlayerState: {
        UNSTARTED: number
        ENDED: number
        PLAYING: number
        PAUSED: number
        BUFFERING: number
        CUED: number
      }
    }
  }
}

export interface YTPlayerInstance {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void
  getCurrentTime: () => number
  getDuration: () => number
  setVolume: (volume: number) => void
  getVolume: () => number
  setPlaybackRate: (rate: number) => void
  getPlaybackRate: () => number
  getPlayerState: () => number
  destroy: () => void
}

interface YouTubePlayerProps {
  videoId: string
  onTimeUpdate: (currentTime: number, duration: number) => void
  onPlaybackStateChange?: (isPlaying: boolean) => void
  autoPlay?: boolean
  minimal?: boolean
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  onTimeUpdate,
  onPlaybackStateChange,
  autoPlay = false,
  minimal = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayerInstance | null>(null)
  const timerRef = useRef<number | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [isReady, setIsReady] = useState(false)

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }
  }, [])

  // Initialize or re-create player when videoId changes
  useEffect(() => {
    let playerInstance: YTPlayerInstance | null = null
    const playerId = `yt-player-${Math.random().toString(36).substring(2, 9)}`

    if (containerRef.current) {
      containerRef.current.id = playerId
    }

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return

      try {
        playerInstance = new window.YT.Player(playerId, {
          videoId,
          playerVars: {
            autoplay: autoPlay ? 1 : 0,
            controls: 0, // Custom controls
            disablekb: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              playerRef.current = event.target
              setIsReady(true)
              setDuration(event.target.getDuration())
              event.target.setVolume(volume)
            },
            onStateChange: (event) => {
              const state = event.data
              const playing = state === 1 // YT.PlayerState.PLAYING
              setIsPlaying(playing)
              onPlaybackStateChange?.(playing)
            },
            onError: (err) => {
              console.warn('YouTube player error code:', err.data)
            },
          },
        })
      } catch (err) {
        console.error('Error initializing YouTube Player', err)
      }
    }

    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        prevCallback?.()
        initPlayer()
      }
    }

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy()
        } catch {}
      }
      playerRef.current = null
      setIsReady(false)
    }
  }, [videoId])

  // Polling playback time to synchronize lyrics with high precision (100ms)
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        if (playerRef.current) {
          try {
            const time = playerRef.current.getCurrentTime()
            const total = playerRef.current.getDuration()
            setCurrentTime(time)
            if (total && total !== duration) setDuration(total)
            onTimeUpdate(time, total)
          } catch {}
        }
      }, 100)
    } else {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
    }
  }, [isPlaying, duration, onTimeUpdate])

  const togglePlay = useCallback(() => {
    if (!playerRef.current || !isReady) return
    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }, [isPlaying, isReady])

  const seek = useCallback((secs: number) => {
    if (!playerRef.current) return
    playerRef.current.seekTo(secs, true)
    setCurrentTime(secs)
  }, [])

  const restart = useCallback(() => {
    seek(0)
    playerRef.current?.playVideo()
  }, [seek])

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol)
    setIsMuted(newVol === 0)
    playerRef.current?.setVolume(newVol)
  }

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false)
      playerRef.current?.setVolume(volume || 50)
    } else {
      setIsMuted(true)
      playerRef.current?.setVolume(0)
    }
  }

  const changeRate = (rate: number) => {
    setPlaybackRate(rate)
    playerRef.current?.setPlaybackRate(rate)
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remSecs = Math.floor(secs % 60)
    return `${mins}:${remSecs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-xl">
      {/* Video Container */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-inner">
        <div ref={containerRef} className="h-full w-full" />

        {/* Status Overlay */}
        <div className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-2 rounded-md bg-black/70 px-2 py-1 text-[11px] font-mono text-white/90 backdrop-blur-sm">
          <Radio className={`h-3 w-3 ${isPlaying ? 'animate-pulse text-emerald-400' : 'text-zinc-400'}`} />
          <span>{isPlaying ? 'PLAYING' : 'PAUSED'}</span>
          <AudioVisualizer isPlaying={isPlaying} barCount={8} />
        </div>

        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in YouTube"
          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white/80 transition-colors hover:bg-black/90 hover:text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Scrubber / Progress Bar */}
      <div className="flex flex-col gap-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={(e) => seek(parseFloat(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[var(--bg-subtle)] accent-[var(--accent)]"
        />
        <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)]">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control Actions */}
      {!minimal && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[var(--border)]">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-black transition-transform hover:scale-105 active:scale-95 shadow-md shadow-[var(--accent-glow)]"
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-black" /> : <Play className="h-5 w-5 fill-black ml-0.5" />}
            </button>

            {/* Restart */}
            <button
              onClick={restart}
              title="Restart from beginning"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)] hover:border-[var(--accent)]"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] p-1 text-xs">
            <Gauge className="h-3.5 w-3.5 ml-1 text-[var(--text-muted)]" />
            {[0.75, 1.0, 1.25].map((rate) => (
              <button
                key={rate}
                onClick={() => changeRate(rate)}
                className={`rounded px-1.5 py-0.5 font-mono text-[11px] transition-colors ${
                  playbackRate === rate
                    ? 'bg-[var(--accent)] text-black font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Volume control */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]"
            >
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
              className="h-1.5 w-16 cursor-pointer appearance-none rounded-lg bg-[var(--bg-subtle)] accent-[var(--accent)]"
            />
          </div>
        </div>
      )}
    </div>
  )
}
