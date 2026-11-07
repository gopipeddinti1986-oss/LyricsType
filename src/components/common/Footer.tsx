import React from 'react'
import { Link } from 'react-router-dom'
import { Music, Heart } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--bg-card)]/40 py-8 text-xs text-[var(--text-muted)]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-[var(--accent)]" />
          <span className="font-semibold text-[var(--text-main)]">LyricsType</span>
          <span>— Music-based synchronized typing practice platform</span>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/songs" className="hover:text-[var(--text-main)]">
            Explore Songs
          </Link>
          <Link to="/multiplayer" className="hover:text-[var(--text-main)]">
            Multiplayer
          </Link>
          <Link to="/coach" className="hover:text-[var(--text-main)]">
            AI Coach
          </Link>
          <Link to="/settings" className="hover:text-[var(--text-main)]">
            Themes & Audio
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span>Crafted with</span>
          <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
          <span>for music lovers & typists</span>
        </div>
      </div>
    </footer>
  )
}
