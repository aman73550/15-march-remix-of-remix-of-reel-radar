
-- Site config table for storing payment keys, pricing, and WhatsApp number
CREATE TABLE public.site_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text NOT NULL UNIQUE,
  config_value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read site_config" ON public.site_config
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert site_config" ON public.site_config
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site_config" ON public.site_config
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_config (config_key, config_value) VALUES
  ('payment_gateway', 'razorpay'),
  ('report_price', '29'),
  ('currency', 'INR'),
  ('whatsapp_number', ''),
  ('razorpay_key_id', ''),
  ('razorpay_key_secret', ''),
  ('stripe_key', '');

-- Paid reports tracking table
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

CREATE POLICY "Admins can read paid_reports" ON public.paid_reports
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert paid_reports" ON public.paid_reports
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
