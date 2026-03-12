-- ============================================
-- COMPLETE DATABASE SETUP
-- Run this in Supabase SQL Editor to create all tables
-- ============================================
-- Last updated: 2026-03-12
-- 
-- USAGE:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Paste this entire file
-- 3. Click "Run"
-- 4. All tables, policies, functions, and default data will be created
-- ============================================


-- =====================
-- 1. ENUMS
-- =====================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');


-- =====================
-- 2. FUNCTIONS
-- =====================
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


-- =====================
-- 3. TABLES
-- =====================

-- 3a. User Roles
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read user_roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));


-- 3b. Usage Logs (free analysis tracking)
CREATE TABLE public.usage_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reel_url text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    user_agent text,
    ip_hash text
);
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read usage_logs"
  ON public.usage_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert usage_logs"
  ON public.usage_logs FOR INSERT TO anon, authenticated
  WITH CHECK (true);


-- 3c. Ad Config (ad slot management)
CREATE TABLE public.ad_config (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_name text UNIQUE NOT NULL,
    enabled boolean NOT NULL DEFAULT true,
    ad_code text,
    updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ad_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ad_config"
  ON public.ad_config FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can update ad_config"
  ON public.ad_config FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert ad_config"
  ON public.ad_config FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Default ad slots
INSERT INTO public.ad_config (slot_name, enabled) VALUES
  ('banner-top', true),
  ('banner-mid', true),
  ('banner-bottom', true),
  ('sidebar-left', true),
  ('sidebar-right', true),
  ('processing-overlay', true);


-- 3d. Viral Patterns (analysis data for comparisons)
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
ALTER TABLE public.viral_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read viral patterns"
  ON public.viral_patterns FOR SELECT TO anon, authenticated
  USING (true);

CREATE INDEX idx_viral_patterns_category ON public.viral_patterns(primary_category);
CREATE INDEX idx_viral_patterns_viral_score ON public.viral_patterns(viral_score DESC);


-- 3e. Site Config (payment keys, pricing, WhatsApp)
CREATE TABLE public.site_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text NOT NULL UNIQUE,
  config_value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read site_config"
  ON public.site_config FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert site_config"
  ON public.site_config FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site_config"
  ON public.site_config FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Default config values
INSERT INTO public.site_config (config_key, config_value) VALUES
  ('payment_gateway', 'razorpay'),
  ('report_price', '29'),
  ('currency', 'INR'),
  ('whatsapp_number', ''),
  ('razorpay_key_id', ''),
  ('razorpay_key_secret', ''),
  ('stripe_key', '');


-- 3f. Paid Reports (purchase tracking)
CREATE TABLE public.paid_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_url text NOT NULL,
  payment_id text,
  payment_gateway text DEFAULT 'razorpay',
  amount numeric NOT NULL DEFAULT 29,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'pending',
  customer_email text,
  customer_phone text,
  pdf_url text,
  analysis_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
ALTER TABLE public.paid_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read paid_reports"
  ON public.paid_reports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert paid_reports"
  ON public.paid_reports FOR INSERT TO anon, authenticated
  WITH CHECK (true);


-- =====================
-- DONE! All tables created.
-- Next: Create an admin user via the create-admin edge function
-- =====================
