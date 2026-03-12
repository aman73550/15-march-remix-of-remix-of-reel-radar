
CREATE TABLE public.viral_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reel_url TEXT NOT NULL,
  author_name TEXT,
  primary_category TEXT,
  sub_category TEXT,
  content_type TEXT,
  hook_type TEXT,
  hook_score SMALLINT,
  caption_score SMALLINT,
  hashtag_score SMALLINT,
  engagement_score SMALLINT,
  trend_score SMALLINT,
  viral_score SMALLINT,
  viral_status TEXT,
  video_length_estimate TEXT,
  scene_cuts TEXT,
  face_presence TEXT,
  text_overlay TEXT,
  motion_intensity TEXT,
  video_quality_score SMALLINT,
  audio_quality_score SMALLINT,
  music_usage TEXT,
  hashtag_count SMALLINT,
  caption_length SMALLINT,
  has_cta BOOLEAN DEFAULT false,
  curiosity_level SMALLINT,
  likes INTEGER,
  comments INTEGER,
  views INTEGER,
  shares INTEGER,
  saves INTEGER,
  engagement_rate NUMERIC(6,4),
  matched_trends TEXT[],
  emotional_triggers TEXT[],
  thumbnail_analyzed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- No RLS needed - this is public analytics data
ALTER TABLE public.viral_patterns ENABLE ROW LEVEL SECURITY;

-- Allow edge functions to insert via service role, and anyone to read
CREATE POLICY "Anyone can read viral patterns"
  ON public.viral_patterns FOR SELECT
  TO anon, authenticated
  USING (true);

-- Index for category-based lookups
CREATE INDEX idx_viral_patterns_category ON public.viral_patterns(primary_category);
CREATE INDEX idx_viral_patterns_viral_score ON public.viral_patterns(viral_score DESC);
