CREATE POLICY "Anyone can read whatsapp_number"
ON public.site_config
FOR SELECT
TO anon, authenticated
USING (config_key = 'whatsapp_number');