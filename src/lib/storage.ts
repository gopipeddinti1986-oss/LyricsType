import type { UserPreferences, TypingSessionRecord, Song } from '@/types'

const PREFS_KEY = 'lyricstype_preferences'
const SESSIONS_KEY = 'lyricstype_sessions'
const CUSTOM_SONGS_KEY = 'lyricstype_custom_songs'

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'spotify',
  soundEffect: 'mechanical',
  soundVolume: 0.6,
  fontSize: 'medium',
  distractionFree: false,
  showVirtualKeyboard: false,
  highlightCurrentWord: true,
  autoScroll: true,
  wpmStandard: 'standard5',
}

export function loadStoredPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) }
    }
  } catch (err) {
    console.error('Failed to load preferences from localStorage', err)
  }
  return DEFAULT_PREFERENCES
}

export function saveStoredPreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch (err) {
    console.error('Failed to save preferences to localStorage', err)
  }
}

export function loadStoredSessions(): TypingSessionRecord[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (err) {
    console.error('Failed to load sessions from localStorage', err)
  }
  return []
}

export function saveStoredSession(session: TypingSessionRecord): void {
  try {
    const sessions = loadStoredSessions()
    sessions.unshift(session) // Latest first
    // Keep max 200 sessions locally
    const trimmed = sessions.slice(0, 200)
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(trimmed))
  } catch (err) {
    console.error('Failed to save session to localStorage', err)
  }
}

export function loadCustomSongs(): Song[] {
  try {
    const raw = localStorage.getItem(CUSTOM_SONGS_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (err) {
    console.error('Failed to load custom songs from localStorage', err)
  }
  return []
}

export function saveCustomSong(song: Song): void {
  try {
    const songs = loadCustomSongs()
    const index = songs.findIndex((s) => s.id === song.id)
    if (index >= 0) {
      songs[index] = song
    } else {
      songs.unshift(song)
    }
    localStorage.setItem(CUSTOM_SONGS_KEY, JSON.stringify(songs))
  } catch (err) {
    console.error('Failed to save custom song to localStorage', err)
  }
}
