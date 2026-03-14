
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS lead_source text DEFAULT '';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS lead_sources jsonb DEFAULT '["Website","WhatsApp","Phone","Walk-in","Facebook","Instagram","Google","Referral"]'::jsonb;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS navbar_items jsonb DEFAULT '{"packages":true,"vehicles":true,"destinations":true,"hotels":true,"offers":true,"blogs":true,"gallery":true,"contact":true}'::jsonb;
