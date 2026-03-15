CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  function_name text NOT NULL,
  window_start timestamp with time zone NOT NULL DEFAULT date_trunc('hour', now()),
  request_count integer NOT NULL DEFAULT 1,
  UNIQUE(ip_hash, function_name, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON public.rate_limits (ip_hash, function_name, window_start);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to rate_limits" ON public.rate_limits
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_ip_hash text,
  p_function_name text,
  p_max_requests integer DEFAULT 30,
  p_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start timestamp with time zone;
  v_count integer;
BEGIN
  v_window_start := date_trunc('hour', now());
  
  SELECT request_count INTO v_count
  FROM public.rate_limits
  WHERE ip_hash = p_ip_hash 
    AND function_name = p_function_name
    AND window_start = v_window_start;
  
  IF v_count IS NULL THEN
    INSERT INTO public.rate_limits (ip_hash, function_name, window_start, request_count)
    VALUES (p_ip_hash, p_function_name, v_window_start, 1)
    ON CONFLICT (ip_hash, function_name, window_start) DO UPDATE SET request_count = rate_limits.request_count + 1;
    RETURN true;
  ELSIF v_count >= p_max_requests THEN
    RETURN false;
  ELSE
    UPDATE public.rate_limits 
    SET request_count = request_count + 1
    WHERE ip_hash = p_ip_hash 
      AND function_name = p_function_name
      AND window_start = v_window_start;
    RETURN true;
  END IF;
END;
$$;