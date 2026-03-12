-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
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

-- RLS: Only admins can read user_roles
CREATE POLICY "Admins can read user_roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create usage_logs table for analytics
CREATE TABLE public.usage_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reel_url text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    user_agent text,
    ip_hash text
);

ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read usage logs
CREATE POLICY "Admins can read usage_logs"
ON public.usage_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can insert usage logs (anonymous tracking)
CREATE POLICY "Anyone can insert usage_logs"
ON public.usage_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create ad_config table
CREATE TABLE public.ad_config (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_name text UNIQUE NOT NULL,
    enabled boolean NOT NULL DEFAULT true,
    ad_code text,
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ad_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read ad config (needed for frontend)
CREATE POLICY "Anyone can read ad_config"
ON public.ad_config
FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can update ad config
CREATE POLICY "Admins can update ad_config"
ON public.ad_config
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert ad_config"
ON public.ad_config
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default ad slots
INSERT INTO public.ad_config (slot_name, enabled) VALUES
('banner-top', true),
('banner-mid', true),
('banner-bottom', true),
('sidebar-left', true),
('sidebar-right', true),
('processing-overlay', true);