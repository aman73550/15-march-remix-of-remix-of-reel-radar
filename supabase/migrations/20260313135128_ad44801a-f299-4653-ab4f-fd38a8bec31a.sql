CREATE POLICY "Anyone can read behaviour_settings"
ON public.site_config
FOR SELECT
TO anon, authenticated
USING (config_key = 'behaviour_settings');