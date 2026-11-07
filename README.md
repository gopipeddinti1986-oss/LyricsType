# 🎵 LyricsType — Music-Synchronized Typing Practice Platform

> **Practice typing to the rhythm of authentic YouTube music with synchronized lyrics, realistic mechanical switch sound effects, multiplayer competitions, and an AI typing coach.**

---

## 🌟 Overview

**LyricsType** is a modern music-based typing SaaS application that bridges rhythm gaming and typing speed mastery. Users paste any YouTube song URL or pick from a rich curated library of songs (English, Telugu, Spanish, Pop, Rock, Melodic), load synchronized lyrics, and practice typing with immediate audio-visual feedback.

### Key Highlights
- **Official YouTube IFrame Player API**: Streams video/audio directly from YouTube without downloading or violating terms.
- **Dedicated Typing Engine**: Sub-millisecond keystroke comparison, character-by-character color highlighting, animated caret cursor, backspace correction, and auto-scrolling.
- **4 Typing Modes**:
  1. `Rhythm Mode`: Timed line synchronization matching the song tempo.
  2. `Normal Mode`: Standard typing flow alongside music playback.
  3. `Challenge Mode`: Zero-tolerance precision mode (mistakes penalize and reset the line).
  4. `Practice Mode`: Music pauses until you accurately complete each line.
- **Standardized WPM Metric**: Computed using the international **5 characters per word standard** ($\text{WPM} = (\text{Chars} / 5) / \text{Minutes}$), distinguishing **Gross WPM** from **Net WPM** with live accuracy tracking.
- **Zero-Latency Web Audio Synthesizer**: Emulates mechanical switch clicks (Cherry MX Blue), deep linear thocks, vintage typewriters, and arcade blips without external audio downloads.
- **Lyrics & Timestamp Studio**: Live timestamp alignment tool (`[mm:ss.xx]` LRC format) to easily sync user-submitted lyrics as the track plays.
- **AI Typing Coach (Groq API)**: Analyzes keystroke consistency, isolates weak characters, and prescribes targeted exercises (with intelligent offline heuristic fallback).
- **Multiplayer Arena (Supabase Realtime)**: Private room generation with 6-digit codes, link invites, matchmaking queue, and real-time racer track progression.
- **Dark Aesthetic Themes**: Spotify Emerald, Monkeytype Amber, Cyberpunk Neon, Synthwave Glow, and Solarized Light.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite, TypeScript |
| **Styling & Design** | Tailwind CSS v4, Lucide React, Framer Motion |
| **Music Streaming** | Official YouTube IFrame Player API |
| **Audio FX** | Browser Web Audio API (Physical Switch Synthesis) |
| **Backend & Realtime** | Supabase (PostgreSQL, Row Level Security, Auth, Realtime) |
| **AI Coach** | Groq API (`llama-3.3-70b-versatile` / `mixtral-8x7b-32768`) |
| **Data Analytics** | Recharts, Canvas Confetti |
| **Testing** | Vitest, JSDOM |
| **Deployment Target** | Vercel |

---

## 📂 Project Architecture

```
LyricsType/
├── index.html                       # HTML template with Google Fonts & metadata
├── vite.config.ts                   # Vite + Tailwind + path aliases + Vitest config
├── tsconfig.json                    # TypeScript project references
├── tsconfig.app.json                # Bundler options & strict TypeScript config
├── .env.example                     # Environment variables template
├── supabase/
│   └── migrations/
│       └── 20260101000000_init_lyricstype_schema.sql  # Complete PostgreSQL schema & RLS policies
├── src/
│   ├── main.tsx                     # React root mount
│   ├── App.tsx                      # Route provider & context orchestration
│   ├── index.css                    # Tailwind CSS + 5 custom themes + animations
│   ├── types/
│   │   └── index.ts                 # Strongly-typed models (Song, LyricSegment, Metrics, Room, Profile)
│   ├── lib/
│   │   ├── wpmCalculator.ts         # 5-char standard Gross/Net WPM & consistency algorithm
│   │   ├── lyricsParser.ts          # LRC parsing, timestamping, YouTube video ID extractor
│   │   ├── soundSynthesis.ts        # Web Audio API switch synthesizer (Clicky, Thock, Typewriter)
│   │   ├── groqCoach.ts             # Groq AI typing analysis & fallback coach
│   │   ├── storage.ts               # LocalStorage sync for guest accounts & offline practice
│   │   ├── supabase.ts              # Supabase client initializer
│   │   └── utils.ts                 # Tailwind utility helpers (clsx/twMerge)
│   ├── context/
│   │   ├── AuthContext.tsx          # Supabase auth + guest profile state
│   │   ├── ThemeContext.tsx         # Theme & font size persistence
│   │   └── AudioSoundContext.tsx    # Keyboard sound effect & volume state
│   ├── data/
│   │   └── curatedSongs.ts          # Pre-synced songs across English, Telugu, Spanish, Pop, Rock
│   ├── components/
│   │   ├── common/                  # Navbar, Footer
│   │   ├── player/                  # Official YouTube IFrame Player with custom scrubbers
│   │   ├── typing/                  # TypingEngineComponent with live HUD & caret animations
│   │   └── lyrics/                  # ManualLyricsEditor & live timestamp alignment tool
│   ├── pages/
│   │   ├── LandingPage.tsx          # Hero showcase, features, curated popular tracks
│   │   ├── SongCatalogPage.tsx      # Song search, language/difficulty filters, custom YouTube adder
│   │   ├── TypingPracticePage.tsx   # Core practice page with synced video + typing engine
│   │   ├── ResultsPage.tsx          # Session analytics, WPM graphs, Groq AI recommendations
│   │   ├── DashboardPage.tsx        # User history, weekly progression charts, aggregates
│   │   ├── MultiplayerPage.tsx      # Real-time room creation, code join, racer progress track
│   │   ├── CoachPage.tsx            # AI keystroke coach, weak keys heatmap, interactive drills
│   │   ├── ProfilePage.tsx          # User profile, badges, community achievements
│   │   ├── SettingsPage.tsx         # Theme selector, switch sounds, font scale, live test bench
│   │   └── AuthPage.tsx             # Sign in, Sign up, Forgot password, Guest mode
│   └── test/
│       ├── setup.ts                 # Vitest test setup
│       ├── wpmCalculator.test.ts    # Comprehensive WPM & consistency unit tests
│       └── lyricsParser.test.ts     # LRC parsing, Telugu/Unicode, YouTube URL tests
```

---

## ⚡ Getting Started (Local Setup)

### 1. Prerequisites
- **Node.js**: v20+ or v22.22.3
- **npm**: v10+

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set the keys (or leave defaults for local sandbox testing):
```ini
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here
```
> *Note: If Supabase or Groq credentials are not provided, LyricsType will automatically fall back to local guest mode with full persistence and heuristic analysis without failing.*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing and Verification

Run the unit test suite:
```bash
npm test
```

Perform strict TypeScript typechecking:
```bash
npm run typecheck
```

Build the production bundle:
```bash
npm run build
```

---

## 🗄️ Database Setup (Supabase)

1. Open your Supabase Dashboard and navigate to the **SQL Editor**.
2. Run the migration script located at:
   ```
   supabase/migrations/20260101000000_init_lyricstype_schema.sql
   ```
3. This creates:
   - `profiles`
   - `user_preferences`
   - `songs`
   - `lyrics`
   - `typing_sessions`
   - `typing_statistics`
   - `multiplayer_rooms`
   - `multiplayer_participants`
   - `user_lyrics_submissions`
4. Enables Row Level Security (RLS) on all tables with granular security policies.

---

## 🚀 Deployment (Vercel)

1. Push your repository to GitHub.
2. In the Vercel Dashboard, import the repository.
3. Configure the Project Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Add your Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GROQ_API_KEY`
5. Click **Deploy**.

---

## 📄 License
MIT License. Built for typists, music enthusiasts, and rhythm gamers.
