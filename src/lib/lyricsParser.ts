import type { LyricSegment } from '@/types'

/**
 * Parses standard LRC format strings into structured LyricSegment items.
 * Example LRC format:
 * [00:14.20]First line of the song
 * [00:18.50]Second line with emotional resonance
 */
export function parseLrc(lrcText: string): LyricSegment[] {
  if (!lrcText || typeof lrcText !== 'string') return []

  const lines = lrcText.split('\n')
  const segments: LyricSegment[] = []
  const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\]/g

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const matches = Array.from(line.matchAll(timeRegex))
    if (matches.length > 0) {
      const text = line.replace(timeRegex, '').trim()
      if (!text) continue // Skip empty timestamped lines (metadata)

      for (const match of matches) {
        const minutes = parseInt(match[1], 10)
        const seconds = parseInt(match[2], 10)
        const millis = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0
        const totalSeconds = minutes * 60 + seconds + millis / 1000

        segments.push({
          id: `lyric-${segments.length}-${Date.now()}`,
          time: parseFloat(totalSeconds.toFixed(2)),
          text,
        })
      }
    }
  }

  // Sort by time ascending
  segments.sort((a, b) => a.time - b.time)

  // Calculate segment end times based on next line's start time
  for (let i = 0; i < segments.length; i++) {
    if (i < segments.length - 1) {
      segments[i].endTime = segments[i + 1].time
    } else {
      // Last segment defaults to start + 5s
      segments[i].endTime = segments[i].time + 5
    }
  }

  return segments
}

/**
 * Converts raw un-synchronized text lines into evenly spaced segments
 * across a given duration (useful as an initial draft before manual sync).
 */
export function parsePlainTextLyrics(text: string, totalDurationSeconds: number = 180): LyricSegment[] {
  if (!text) return []

  const rawLines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (rawLines.length === 0) return []

  const interval = Math.max(2, (totalDurationSeconds * 0.9) / rawLines.length)
  const segments: LyricSegment[] = []

  let currentTime = 5 // Start 5 seconds in

  for (let i = 0; i < rawLines.length; i++) {
    const lineText = rawLines[i]
    segments.push({
      id: `manual-segment-${i}`,
      time: parseFloat(currentTime.toFixed(2)),
      endTime: parseFloat((currentTime + interval).toFixed(2)),
      text: lineText,
    })
    currentTime += interval
  }

  return segments
}

/**
 * Formats a timestamp in seconds to mm:ss format.
 */
export function formatTimestamp(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Formats a timestamp to full LRC tag [mm:ss.xx].
 */
export function formatLrcTag(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const hundredths = Math.floor((seconds % 1) * 100)
  return `[${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}]`
}

/**
 * Converts an array of LyricSegment back into a standard LRC string.
 */
export function exportToLrc(segments: LyricSegment[]): string {
  return segments
    .map((s) => `${formatLrcTag(s.time)} ${s.text}`)
    .join('\n')
}

/**
 * Extracts YouTube Video ID from any valid YouTube URL or raw ID.
 * Supports:
 * - youtube.com/watch?v=VIDEO_ID
 * - youtu.be/VIDEO_ID
 * - youtube.com/embed/VIDEO_ID
 * - youtube.com/shorts/VIDEO_ID
 * - Direct 11-char video ID (e.g. dQw4w9WgXcQ)
 */
export function extractYouTubeVideoId(urlOrId: string): string | null {
  if (!urlOrId || typeof urlOrId !== 'string') return null
  const trimmed = urlOrId.trim()

  // Common YouTube URL regex patterns
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
    /[?&]v=([^&#]{11})/,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match && match[1] && match[1].length === 11) {
      return match[1]
    }
  }

  // Direct 11-character video ID
  // YouTube video IDs use base64 characters: [a-zA-Z0-9_-], but valid IDs have mixed case/digits,
  // not generic English slug words like "invalid-url" or "example-test"
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    // If it's a generic hyphenated word without digits or mixed uppercase, treat as invalid
    if (trimmed.includes('-') && !/[0-9]/.test(trimmed) && !/[A-Z]/.test(trimmed)) {
      return null
    }
    return trimmed
  }

  return null
}
