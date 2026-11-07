-- ==============================================================================
-- LyricsType Supabase PostgreSQL Database Schema & Migrations
-- ==============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  email TEXT,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  total_practice_time_seconds INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  best_wpm INTEGER DEFAULT 0,
  average_wpm NUMERIC(5,2) DEFAULT 0,
  average_accuracy NUMERIC(5,2) DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'spotify',
  sound_effect TEXT DEFAULT 'mechanical',
  sound_volume NUMERIC(3,2) DEFAULT 0.6,
  font_size TEXT DEFAULT 'medium',
  distraction_free BOOLEAN DEFAULT FALSE,
  show_virtual_keyboard BOOLEAN DEFAULT FALSE,
  highlight_current_word BOOLEAN DEFAULT TRUE,
  auto_scroll BOOLEAN DEFAULT TRUE,
  wpm_standard TEXT DEFAULT 'standard5',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SONGS TABLE
CREATE TABLE IF NOT EXISTS public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL,
  cover_url TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 180,
  language TEXT NOT NULL DEFAULT 'English',
  genre TEXT DEFAULT 'Pop',
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'extreme')),
  bpm INTEGER,
  is_curated BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  submitter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LYRICS TABLE
CREATE TABLE IF NOT EXISTS public.lyrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  is_synchronized BOOLEAN DEFAULT TRUE,
  language TEXT NOT NULL DEFAULT 'English',
  raw_lrc TEXT,
  segments_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TYPING SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.typing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  song_id UUID REFERENCES public.songs(id) ON DELETE SET NULL,
  song_title TEXT NOT NULL,
  song_artist TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'normal' CHECK (mode IN ('normal', 'rhythm', 'challenge', 'practice')),
  gross_wpm INTEGER NOT NULL DEFAULT 0,
  net_wpm INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_typed_chars INTEGER NOT NULL DEFAULT 0,
  correct_chars INTEGER NOT NULL DEFAULT 0,
  incorrect_chars INTEGER NOT NULL DEFAULT 0,
  errors_count INTEGER NOT NULL DEFAULT 0,
  elapsed_seconds INTEGER NOT NULL DEFAULT 0,
  completion_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  character_stats JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TYPING STATISTICS TABLE
CREATE TABLE IF NOT EXISTS public.typing_statistics (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_keystrokes BIGINT DEFAULT 0,
  total_errors BIGINT DEFAULT 0,
  highest_streak INTEGER DEFAULT 0,
  weak_characters JSONB DEFAULT '{}'::jsonb,
  weekly_stats JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MULTIPLAYER ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.multiplayer_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(8) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  song_title TEXT NOT NULL,
  song_artist TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'starting', 'in_progress', 'finished')),
  countdown INTEGER DEFAULT 5,
  mode TEXT NOT NULL DEFAULT 'rhythm' CHECK (mode IN ('normal', 'rhythm', 'challenge', 'practice')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MULTIPLAYER PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.multiplayer_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.multiplayer_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  progress_percent NUMERIC(5,2) DEFAULT 0,
  current_wpm INTEGER DEFAULT 0,
  accuracy NUMERIC(5,2) DEFAULT 100,
  is_finished BOOLEAN DEFAULT FALSE,
  finish_rank INTEGER,
  finish_time_seconds NUMERIC(6,2),
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- 9. USER LYRICS SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.user_lyrics_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  song_title TEXT NOT NULL,
  song_artist TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'English',
  lyrics_lrc TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  moderation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_songs_youtube_video_id ON public.songs(youtube_video_id);
CREATE INDEX IF NOT EXISTS idx_songs_language ON public.songs(language);
CREATE INDEX IF NOT EXISTS idx_songs_genre ON public.songs(genre);
CREATE INDEX IF NOT EXISTS idx_lyrics_song_id ON public.lyrics(song_id);
CREATE INDEX IF NOT EXISTS idx_typing_sessions_user_id ON public.typing_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_sessions_created_at ON public.typing_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_multiplayer_rooms_code ON public.multiplayer_rooms(code);
CREATE INDEX IF NOT EXISTS idx_multiplayer_participants_room ON public.multiplayer_participants(room_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multiplayer_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multiplayer_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lyrics_submissions ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can read profile cards; owners can update their own
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Preferences: Private to owner
CREATE POLICY "Users can view own preferences" 
  ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own preferences" 
  ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- Songs & Lyrics: Public read, authenticated users can insert
CREATE POLICY "Songs viewable by everyone" 
  ON public.songs FOR SELECT USING (true);

CREATE POLICY "Authenticated users can submit songs" 
  ON public.songs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Lyrics viewable by everyone" 
  ON public.lyrics FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create lyrics" 
  ON public.lyrics FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Typing Sessions: Users can only see and write their own sessions
CREATE POLICY "Users can view own typing sessions" 
  ON public.typing_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own typing sessions" 
  ON public.typing_sessions FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Multiplayer Rooms: Visible to participants/public in lobby
CREATE POLICY "Multiplayer rooms viewable by everyone" 
  ON public.multiplayer_rooms FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create multiplayer rooms" 
  ON public.multiplayer_rooms FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Host can update room" 
  ON public.multiplayer_rooms FOR UPDATE USING (auth.uid() = host_id);

-- Multiplayer Participants: Visible to room players
CREATE POLICY "Participants viewable by everyone in room" 
  ON public.multiplayer_participants FOR SELECT USING (true);

CREATE POLICY "Participants can update their own progress" 
  ON public.multiplayer_participants FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Submissions: Users can view their own submissions
CREATE POLICY "Users can view own submissions" 
  ON public.user_lyrics_submissions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert submissions" 
  ON public.user_lyrics_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
