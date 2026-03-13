CREATE TABLE public.api_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,
  ai_model text DEFAULT NULL,
  ai_provider text DEFAULT NULL,
  is_ai_call boolean NOT NULL DEFAULT false,
  estimated_cost numeric NOT NULL DEFAULT 0,
  tokens_used integer DEFAULT 0,
  status_code integer DEFAULT 200,
  duration_ms integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read api_usage_logs"
ON public.api_usage_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role inserts api_usage_logs"
ON public.api_usage_logs
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE INDEX idx_api_usage_logs_created_at ON public.api_usage_logs (created_at DESC);
CREATE INDEX idx_api_usage_logs_function_name ON public.api_usage_logs (function_name);