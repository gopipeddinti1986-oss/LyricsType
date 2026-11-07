export type TypingMode = 'normal' | 'rhythm' | 'challenge' | 'practice'

export type AppTheme = 'spotify' | 'monkeytype' | 'cyberpunk' | 'synthwave' | 'light'

export type KeyboardSound = 'mechanical' | 'thock' | 'typewriter' | 'beep' | 'off'

export interface LyricWord {
  text: string
  startTime?: number
  endTime?: number
}

export interface LyricSegment {
  id: string
  time: number // in seconds
  endTime?: number
  text: string
  words?: LyricWord[]
  translation?: string
}

export interface Song {
  id: string
  title: string
  artist: string
  youtubeUrl: string
  youtubeVideoId: string
  coverUrl?: string
  duration: number // in seconds
  language: string
  genre: string
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme'
  hasSyncLyrics: boolean
  lyrics: LyricSegment[]
  bpm?: number
  isCurated?: boolean
  viewCount?: number
  submitterId?: string
}

export interface TypingMetrics {
  grossWpm: number // (allTypedChars / 5) / (timeInMinutes)
  netWpm: number // ((allTypedChars - uncorrectedErrors) / 5) / (timeInMinutes)
  accuracy: number // (correctChars / totalTypedChars) * 100
  correctChars: number
  incorrectChars: number
  totalTypedChars: number
  errorsCount: number
  elapsedSeconds: number
  completionRate: number // percentage of song/lyrics completed
  characterStats: Record<string, { correct: number; incorrect: number }>
}

export interface TypingSessionRecord {
  id: string
  songId: string
  songTitle: string
  songArtist: string
  mode: TypingMode
  metrics: TypingMetrics
  createdAt: string
  userId?: string
}

export interface UserPreferences {
  theme: AppTheme
  soundEffect: KeyboardSound
  soundVolume: number // 0 to 1
  fontSize: 'small' | 'medium' | 'large' | 'huge'
  distractionFree: boolean
  showVirtualKeyboard: boolean
  highlightCurrentWord: boolean
  autoScroll: boolean
  wpmStandard: 'standard5' | 'actualWords'
}

export interface UserProfile {
  id: string
  email: string
  username: string
  avatarUrl?: string
  bio?: string
  createdAt: string
  totalPracticeTimeSeconds: number
  totalSessions: number
  bestWpm: number
  averageWpm: number
  averageAccuracy: number
  preferences: UserPreferences
}

export interface MultiplayerPlayer {
  id: string
  username: string
  avatarUrl?: string
  progress: number // 0 to 100
  currentWpm: number
  accuracy: number
  isFinished: boolean
  rank?: number
  finishTimeSeconds?: number
}

export interface MultiplayerRoom {
  id: string
  code: string
  name: string
  hostId: string
  songId: string
  songTitle: string
  songArtist: string
  youtubeVideoId: string
  status: 'waiting' | 'starting' | 'in_progress' | 'finished'
  countdown: number
  players: MultiplayerPlayer[]
  createdAt: string
  mode: TypingMode
}

export interface AICoachAnalysis {
  summary: string
  overallGrade: 'S' | 'A' | 'B' | 'C' | 'D'
  weakKeys: string[]
  strengths: string[]
  rhythmConsistency: string
  recommendedDrills: {
    title: string
    description: string
    sampleText: string
  }[]
  actionableTips: string[]
}
