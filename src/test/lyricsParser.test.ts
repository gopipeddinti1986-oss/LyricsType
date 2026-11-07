import { describe, it, expect } from 'vitest'
import { parseLrc, extractYouTubeVideoId, formatTimestamp, exportToLrc } from '../lib/lyricsParser'

describe('Lyrics Parser and YouTube Utilities', () => {
  it('extracts video ID from multiple YouTube URL formats', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(extractYouTubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(extractYouTubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(extractYouTubeVideoId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(extractYouTubeVideoId('invalid-url')).toBe(null)
  })

  it('parses synchronized LRC content correctly', () => {
    const lrc = `
[00:10.50]Is this the real life?
[00:14.20]Is this just fantasy?
[00:18.00]Caught in a landslide, no escape from reality
    `
    const segments = parseLrc(lrc)
    expect(segments.length).toBe(3)
    expect(segments[0].time).toBe(10.5)
    expect(segments[0].text).toBe('Is this the real life?')
    expect(segments[1].time).toBe(14.2)
    expect(segments[1].text).toBe('Is this just fantasy?')
    expect(segments[0].endTime).toBe(14.2)
  })

  it('handles Unicode and Telugu characters correctly', () => {
    const lrc = `
[00:05.00]నమస్కారం ప్రపంచం
[00:10.00]సంగీతం తో టైపింగ్ ప్రాక్టీస్
    `
    const segments = parseLrc(lrc)
    expect(segments.length).toBe(2)
    expect(segments[0].text).toBe('నమస్కారం ప్రపంచం')
    expect(segments[1].text).toBe('సంగీతం తో టైపింగ్ ప్రాక్టీస్')
  })

  it('formats timestamp to mm:ss', () => {
    expect(formatTimestamp(65)).toBe('01:05')
    expect(formatTimestamp(0)).toBe('00:00')
    expect(formatTimestamp(125.4)).toBe('02:05')
  })

  it('exports segments back to valid LRC format', () => {
    const segments = [
      { id: '1', time: 12.5, text: 'Hello' },
      { id: '2', time: 18.0, text: 'World' },
    ]
    const exported = exportToLrc(segments)
    expect(exported).toContain('[00:12.50] Hello')
    expect(exported).toContain('[00:18.00] World')
  })
})
