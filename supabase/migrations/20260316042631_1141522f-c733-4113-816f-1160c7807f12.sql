
-- Ad impressions tracking table
CREATE TABLE public.ad_impressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_name text NOT NULL,
  event_type text NOT NULL DEFAULT 'impression',
  device_type text DEFAULT 'desktop',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  session_id text,
  error_message text
);

-- Enable RLS
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (tracking)
CREATE POLICY "Anyone can insert ad_impressions" ON public.ad_impressions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Admins can read
CREATE POLICY "Admins can read ad_impressions" ON public.ad_impressions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Add device_target column to ad_config
ALTER TABLE public.ad_config ADD COLUMN IF NOT EXISTS device_target text NOT NULL DEFAULT 'both';

-- Add ad_name column to ad_config  
ALTER TABLE public.ad_config ADD COLUMN IF NOT EXISTS ad_name text;

-- Add trigger_type for popup/popunder
ALTER TABLE public.ad_config ADD COLUMN IF NOT EXISTS trigger_type text;

-- Add frequency_limit for popup ads
ALTER TABLE public.ad_config ADD COLUMN IF NOT EXISTS frequency_limit text DEFAULT 'once_per_session';
