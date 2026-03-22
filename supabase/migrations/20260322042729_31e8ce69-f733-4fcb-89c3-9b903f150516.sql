CREATE TABLE public.user_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reel_url text NOT NULL,
  viral_score smallint,
  analysis_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own analyses"
  ON public.user_analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON public.user_analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all user_analyses"
  ON public.user_analyses FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_config (config_key, config_value)
VALUES ('user_analysis_limit', '2')
ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone can read analysis_limit"
  ON public.site_config FOR SELECT
  TO anon, authenticated
  USING (config_key = 'user_analysis_limit');