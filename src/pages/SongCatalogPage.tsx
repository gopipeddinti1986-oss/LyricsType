import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  Plus,
  Play,
  Music,
  Filter,
  Film,
  Sparkles,
  Check,
  AlertCircle,
} from 'lucide-react'
import { CURATED_SONGS } from '@/data/curatedSongs'
import { loadCustomSongs, saveCustomSong } from '@/lib/storage'
import { extractYouTubeVideoId, parsePlainTextLyrics } from '@/lib/lyricsParser'
import type { Song } from '@/types'

export const SongCatalogPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [selectedGenre, setSelectedGenre] = useState('All')

  // Custom song modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [customUrl, setCustomUrl] = useState('')
  const [customTitle, setCustomTitle] = useState('')
  const [customArtist, setCustomArtist] = useState('')
  const [customLyrics, setCustomLyrics] = useState('')
  const [customError, setCustomError] = useState('')

  // Load custom songs from local storage
  const [customSongsList, setCustomSongsList] = useState<Song[]>(() => loadCustomSongs())

  // Combine curated and custom songs
  const allSongs = useMemo(() => {
    return [...customSongsList, ...CURATED_SONGS]
  }, [customSongsList])

  // Filter songs
  const filteredSongs = useMemo(() => {
    return allSongs.filter((song) => {
      const matchesSearch =
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.genre.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesLang = selectedLanguage === 'All' || song.language === selectedLanguage
      const matchesDiff = selectedDifficulty === 'All' || song.difficulty === selectedDifficulty
      const matchesGenre = selectedGenre === 'All' || song.genre.includes(selectedGenre)

      return matchesSearch && matchesLang && matchesDiff && matchesGenre
    })
  }, [allSongs, searchQuery, selectedLanguage, selectedDifficulty, selectedGenre])

  const handleAddCustomSong = (e: React.FormEvent) => {
    e.preventDefault()
    setCustomError('')

    const videoId = extractYouTubeVideoId(customUrl)
    if (!videoId) {
      setCustomError('Please provide a valid YouTube URL or 11-character video ID.')
      return
    }

    if (!customTitle.trim()) {
      setCustomError('Please enter a song title.')
      return
    }

    const segments = customLyrics.trim()
      ? parsePlainTextLyrics(customLyrics)
      : [
          { id: '1', time: 5, endTime: 10, text: 'Sample line 1 - use the Lyrics Studio to adjust timestamps' },
          { id: '2', time: 10, endTime: 15, text: 'Sample line 2 - type along as you listen to the music' },
        ]

    const newSong: Song = {
      id: `custom-${videoId}-${Date.now()}`,
      title: customTitle.trim(),
      artist: customArtist.trim() || 'Unknown Artist',
      youtubeUrl: customUrl,
      youtubeVideoId: videoId,
      coverUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration: 180,
      language: 'English',
      genre: 'Custom Track',
      difficulty: 'medium',
      hasSyncLyrics: true,
      lyrics: segments,
      isCurated: false,
    }

    saveCustomSong(newSong)
    setCustomSongsList(loadCustomSongs())
    setShowAddModal(false)
    navigate(`/play/${newSong.id}`)
  }

  const languages = ['All', 'English', 'Telugu', 'Spanish']
  const difficulties = ['All', 'easy', 'medium', 'hard', 'extreme']

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-main)]">
            Song Catalog
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Explore curated music tracks or paste any custom YouTube link to practice typing.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-black shadow-lg shadow-[var(--accent-glow)] transition-transform hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add Custom YouTube Song</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs, artists, or genres..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]/60 focus:border-[var(--accent)] focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 rounded-xl bg-[var(--bg-subtle)] p-1">
            <span className="px-2 text-[var(--text-muted)]">Language:</span>
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                  selectedLanguage === lang
                    ? 'bg-[var(--accent)] text-black'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-[var(--bg-subtle)] p-1">
            <span className="px-2 text-[var(--text-muted)]">Difficulty:</span>
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`rounded-lg px-2.5 py-1 capitalize font-medium transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-[var(--accent)] text-black'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Song Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSongs.map((song) => (
          <Link
            key={song.id}
            to={`/play/${song.id}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 transition-all hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-xl hover:shadow-[var(--accent-glow)]"
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
              <img
                src={song.coverUrl || `https://img.youtube.com/vi/${song.youtubeVideoId}/hqdefault.jpg`}
                alt={song.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-85"
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
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">
                  {song.title}
                </h3>
                {song.isCurated && (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                    Verified
                  </span>
                )}
              </div>
              <span className="text-xs text-[var(--text-muted)]">{song.artist}</span>
              <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                <span>{song.genre}</span>
                <span>{song.lyrics.length} Lines Synced</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredSongs.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border)] p-8 text-center">
          <Music className="h-10 w-10 text-[var(--text-muted)]" />
          <h3 className="mt-3 text-base font-bold text-[var(--text-main)]">
            No matching songs found
          </h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Try adjusting your search criteria or add your custom YouTube song.
          </p>
        </div>
      )}

      {/* Add Custom Song Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-2">
                <Film className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-bold text-[var(--text-main)]">
                  Add Custom YouTube Track
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomSong} className="mt-4 flex flex-col gap-4">
              {customError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-400 border border-red-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{customError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-[var(--text-muted)]">
                  YouTube Song URL or Video ID:
                </label>
                <input
                  type="text"
                  required
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-2.5 text-xs text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)]">Song Title:</label>
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Starboy"
                    className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-2.5 text-xs text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)]">Artist:</label>
                  <input
                    type="text"
                    value={customArtist}
                    onChange={(e) => setCustomArtist(e.target.value)}
                    placeholder="e.g. The Weeknd"
                    className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-2.5 text-xs text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-muted)]">
                  Lyrics (Optional - or customize later in Lyrics Studio):
                </label>
                <textarea
                  rows={4}
                  value={customLyrics}
                  onChange={(e) => setCustomLyrics(e.target.value)}
                  placeholder="Paste lyrics or leave blank to align inside player..."
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-2.5 text-xs text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-xs font-bold text-black shadow-md hover:scale-105 active:scale-95"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Load & Play Track</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
