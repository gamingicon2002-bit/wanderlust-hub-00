-- Create customers table
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  gst_number text DEFAULT '',
  total_invoices integer DEFAULT 0,
  total_spent numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX customers_email_unique ON public.customers (email) WHERE email != '';

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage customers" ON public.customers FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add price field to itineraries (optional)
ALTER TABLE public.itineraries ADD COLUMN IF NOT EXISTS total_price numeric DEFAULT 0;
ALTER TABLE public.itineraries ADD COLUMN IF NOT EXISTS price_includes_driver boolean DEFAULT true;
ALTER TABLE public.itineraries ADD COLUMN IF NOT EXISTS background_image text DEFAULT '';