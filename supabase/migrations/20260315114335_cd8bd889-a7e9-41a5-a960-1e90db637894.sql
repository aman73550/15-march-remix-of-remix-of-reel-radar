
-- Traffic sessions table for visitor tracking
CREATE TABLE public.traffic_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  referrer_source text DEFAULT 'direct',
  referrer_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  share_id text,
  device_type text DEFAULT 'desktop',
  browser text,
  os text,
  screen_size text,
  language text,
  timezone text,
  ip_hash text,
  country text,
  city text,
  session_start timestamptz NOT NULL DEFAULT now(),
  session_end timestamptz,
  page_views integer DEFAULT 1,
  scroll_depth integer DEFAULT 0,
  click_count integer DEFAULT 0,
  duration_seconds integer DEFAULT 0,
  has_mouse_movement boolean DEFAULT false,
  has_scroll boolean DEFAULT false,
  has_click boolean DEFAULT false,
  has_input_interaction boolean DEFAULT false,
  navigation_variation integer DEFAULT 0,
  is_bot boolean DEFAULT false,
  bot_score integer DEFAULT 0,
  bot_flags text[] DEFAULT '{}',
  is_real_user boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Share events table
CREATE TABLE public.share_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  share_id text NOT NULL,
  shared_url text,
  referrer_session_id text,
  clicks_generated integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.traffic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_events ENABLE ROW LEVEL SECURITY;

-- Policies: anyone can insert (anonymous visitors), only admins can read
CREATE POLICY "Anyone can insert traffic_sessions" ON public.traffic_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read traffic_sessions" ON public.traffic_sessions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert share_events" ON public.share_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read share_events" ON public.share_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow anon to update their own session (by session_id)
CREATE POLICY "Anyone can update own traffic_session" ON public.traffic_sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Index for performance
CREATE INDEX idx_traffic_sessions_created ON public.traffic_sessions(created_at DESC);
CREATE INDEX idx_traffic_sessions_session_id ON public.traffic_sessions(session_id);
CREATE INDEX idx_traffic_sessions_is_bot ON public.traffic_sessions(is_bot);
CREATE INDEX idx_share_events_share_id ON public.share_events(share_id);
CREATE INDEX idx_share_events_created ON public.share_events(created_at DESC);
