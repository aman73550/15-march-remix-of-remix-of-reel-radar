
-- Allow anyone to read analysis pricing config (needed by frontend before analysis)
CREATE POLICY "Anyone can read analysis_pricing" ON public.site_config
  FOR SELECT TO anon, authenticated
  USING (config_key IN ('analysis_pricing_mode', 'analysis_price'));
